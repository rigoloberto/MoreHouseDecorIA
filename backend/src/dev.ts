import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

async function testGeminiModel(apiKey: string, modelName: string): Promise<{ accessible: boolean; error?: string }> {
  try {
    const cleanName = modelName.startsWith("models/") ? modelName : `models/${modelName}`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${cleanName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "ping" }] }]
        })
      }
    );
    const data = await response.json();
    if (response.ok && data.candidates) {
      return { accessible: true };
    }
    return { accessible: false, error: data.error?.message || JSON.stringify(data) };
  } catch (err: any) {
    return { accessible: false, error: err.message || String(err) };
  }
}

async function testHuggingFace(token: string): Promise<{ accessible: boolean; error?: string }> {
  try {
    const response = await fetch(
      "https://huggingface.co/api/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    if (response.ok) {
      return { accessible: true };
    }
    const errText = await response.text();
    return { accessible: false, error: `HTTP ${response.status}: ${errText}` };
  } catch (err: any) {
    return { accessible: false, error: err.message || String(err) };
  }
}

async function testReplicate(token: string): Promise<{ accessible: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    
    if (response.status === 422) {
      // 422 Unprocessable Entity means authenticated and billing is valid
      return { accessible: true };
    }
    
    const data = await response.json().catch(() => ({}));
    const errText = data.detail || `HTTP ${response.status}`;
    
    if (response.status === 402) {
      return { accessible: false, error: `Payment Required (402): ${errText}. Por favor ingresa una tarjeta de crédito en tu cuenta de Replicate.` };
    }
    if (response.status === 401) {
      return { accessible: false, error: `Unauthorized (401): ${errText}. Tu token de Replicate es inválido o no está configurado.` };
    }
    
    return { accessible: false, error: errText };
  } catch (err: any) {
    return { accessible: false, error: err.message || String(err) };
  }
}

const app = new Elysia()
  .use(cors())
  .get('/', () => ({
    message: "Servidor de Diagnóstico de Modelos de IA activo con verificación de bloqueos.",
    endpoint: "Accede a http://localhost:3001/api/models para ver los modelos de tus APIs."
  }))
  .get('/api/models', async () => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const hfToken = process.env.HF_TOKEN;
    const replicateToken = process.env.REPLICATE_API_TOKEN;

    const results: any = {
      gemini: { status: "not_configured", models: [] },
      cloudflare: { status: "not_configured", models: [] },
      huggingface: { status: "not_configured", models: [] },
      replicate: { status: "not_configured", models: [] }
    };

    // 1. DIAGNÓSTICO GEMINI + COMPROBACIÓN DE BLOQUEOS
    if (geminiApiKey) {
      try {
        console.log("Consultando modelos de Gemini...");
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`
        );
        const data = await response.json();
        if (response.ok && data.models) {
          const modelsToTest = [
            "gemini-2.5-flash",
            "gemini-3.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-flash-lite-latest",
            "gemini-flash-latest",
            "gemini-1.5-flash",
            "gemini-2.5-flash-image",
            "gemini-3.1-flash-image",
            "gemini-3-pro-image",
            "nano-banana-pro-preview"
          ];

          // Probamos los modelos principales en paralelo para ahorrar tiempo
          const testPromises = data.models.map(async (m: any) => {
            const shortName = m.name.replace("models/", "");
            const isTarget = modelsToTest.includes(shortName);
            const supportsGenerate = m.supportedGenerationMethods.includes("generateContent");
            
            if (isTarget && supportsGenerate) {
              console.log(`Probando acceso al modelo: ${shortName}...`);
              const testResult = await testGeminiModel(geminiApiKey, m.name);
              let status = "blocked";
              let info = "Bloqueado o sin acceso.";
              
              if (testResult.accessible) {
                status = "active";
                info = "Listo para usar.";
              } else {
                const errMsg = testResult.error || "";
                if (errMsg.includes("demand") || errMsg.includes("quota") || errMsg.includes("ResourceExhausted") || errMsg.includes("limit")) {
                  status = "rate_limited";
                  info = `Límite de cuota excedido o alta demanda en este modelo: ${errMsg}`;
                } else {
                  status = "blocked";
                  info = `Bloqueado/Error de acceso: ${errMsg}`;
                }
              }

              return {
                name: m.name,
                displayName: m.displayName,
                supportedMethods: m.supportedGenerationMethods,
                tested: true,
                accessible: testResult.accessible,
                status,
                info,
                error: testResult.error || null
              };
            } else {
              return {
                name: m.name,
                displayName: m.displayName,
                supportedMethods: m.supportedGenerationMethods,
                tested: false,
                accessible: null,
                status: supportsGenerate ? "untested" : "not_supported",
                info: supportsGenerate ? "No verificado para ahorrar tiempo de carga." : "Este modelo no soporta generación de contenido de texto.",
                error: null
              };
            }
          });

          const testedModels = await Promise.all(testPromises);
          results.gemini = {
            status: "ok",
            models: testedModels
          };
        } else {
          results.gemini = {
            status: "error",
            error: data.error || data,
            message: "La clave es válida pero la API retornó un error."
          };
        }
      } catch (err: any) {
        results.gemini = {
          status: "exception",
          error: err.message || err
        };
      }
    }

    // 2. DIAGNÓSTICO CLOUDFLARE
    if (cfAccountId && cfApiToken) {
      try {
        console.log("Consultando modelos de Cloudflare Workers AI...");
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/models/search?type=text-to-image`,
          {
            headers: {
              'Authorization': `Bearer ${cfApiToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await response.json();
        if (response.ok && data.result) {
          results.cloudflare = {
            status: "ok",
            overallAccess: {
              tested: true,
              accessible: true,
              error: null
            },
            models: data.result.map((m: any) => ({
              name: m.name,
              description: m.description,
              task: m.taskName,
              tested: true,
              accessible: true,
              status: "active",
              info: "Listo para usar.",
              error: null
            }))
          };
        } else {
          const errText = data.errors?.[0]?.message || JSON.stringify(data);
          results.cloudflare = {
            status: "error",
            error: errText,
            message: "Error de autenticación o de API al consultar Cloudflare."
          };
        }
      } catch (err: any) {
        results.cloudflare = {
          status: "exception",
          error: err.message || err
        };
      }
    }

    // 3. DIAGNÓSTICO HUGGING FACE + COMPROBACIÓN FLUX
    if (hfToken) {
      try {
        console.log("Verificando acceso a Hugging Face FLUX...");
        const testResult = await testHuggingFace(hfToken);
        
        let hfStatus = testResult.accessible ? "active" : "blocked";
        let hfInfo = testResult.accessible ? "Listo para usar." : `Bloqueado / Error: ${testResult.error}`;

        const response = await fetch(
          "https://huggingface.co/api/models?filter=text-to-image&sort=downloads&direction=-1&limit=5",
          {
            headers: { 'Authorization': `Bearer ${hfToken}` }
          }
        );
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          results.huggingface = {
            status: "ok",
            fluxAccess: {
              model: "black-forest-labs/FLUX.1-schnell",
              tested: true,
              accessible: testResult.accessible,
              status: hfStatus,
              info: hfInfo,
              error: testResult.error || null
            },
            models: data.map((m: any) => ({
              id: m.modelId,
              downloads: m.downloads,
              likes: m.likes,
              tested: true,
              accessible: testResult.accessible,
              status: hfStatus,
              info: hfInfo,
              error: testResult.error || null
            }))
          };
        } else {
          results.huggingface = {
            status: "error",
            error: data,
            message: "Error de autenticación o de API en Hugging Face."
          };
        }
      } catch (err: any) {
        results.huggingface = {
          status: "exception",
          error: err.message || err
        };
      }
    }

    // 4. DIAGNÓSTICO REPLICATE + COMPROBACIÓN IMAGEN 4
    if (replicateToken) {
      try {
        console.log("Probando credenciales y facturación en Replicate...");
        const testResult = await testReplicate(replicateToken);
        
        let repStatus = testResult.accessible ? "active" : "blocked";
        let repInfo = testResult.accessible ? "Listo para usar." : `Bloqueado: ${testResult.error}`;

        if (testResult.accessible) {
          console.log("Consultando modelo google/imagen-4 en Replicate...");
          const response = await fetch(
            "https://api.replicate.com/v1/models/google/imagen-4",
            {
              headers: {
                "Authorization": `Token ${replicateToken}`,
                "Content-Type": "application/json"
              }
            }
          );
          const data = await response.json();
          if (response.ok && data.name) {
            results.replicate = {
              status: "ok",
              models: [{
                name: "google/imagen-4",
                owner: data.owner,
                description: data.description,
                tested: true,
                accessible: true,
                status: "active",
                info: "Listo para usar.",
                error: null
              }]
            };
          } else {
            results.replicate = {
              status: "ok",
              models: [{
                name: "google/imagen-4",
                tested: true,
                accessible: false,
                status: "blocked",
                info: `El token es válido pero no tienes acceso a google/imagen-4: ${JSON.stringify(data)}`,
                error: JSON.stringify(data)
              }]
            };
          }
        } else {
          results.replicate = {
            status: "ok",
            models: [{
              name: "google/imagen-4",
              tested: true,
              accessible: false,
              status: "blocked",
              info: repInfo,
              error: testResult.error || "Error de autenticación o saldo en Replicate."
            }]
          };
        }
      } catch (err: any) {
        results.replicate = {
          status: "exception",
          error: err.message || err
        };
      }
    }

    return results;
  })
  .listen(3001);

console.log(`Servidor de Diagnóstico activo en http://localhost:3001`);
console.log(`Visita http://localhost:3001/api/models en Chrome para ver el JSON.`);
