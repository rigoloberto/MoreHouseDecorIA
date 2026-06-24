import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

const app = new Elysia()
  .use(cors())
  .get('/', () => ({
    message: "Servidor de Diagnóstico de Modelos de IA activo.",
    endpoint: "Accede a http://localhost:3001/api/models para ver los modelos de tus APIs."
  }))
  .get('/api/models', async () => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const hfToken = process.env.HF_TOKEN;

    const results: any = {
      gemini: { status: "not_configured", models: [] },
      cloudflare: { status: "not_configured", models: [] },
      huggingface: { status: "not_configured", models: [] }
    };

    // 1. DIAGNÓSTICO GEMINI
    if (geminiApiKey) {
      try {
        console.log("Consultando modelos de Gemini...");
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`
        );
        const data = await response.json();
        if (response.ok && data.models) {
          results.gemini = {
            status: "ok",
            models: data.models.map((m: any) => ({
              name: m.name,
              displayName: m.displayName,
              supportedMethods: m.supportedGenerationMethods
            }))
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
            models: data.result.map((m: any) => ({
              name: m.name,
              description: m.description,
              task: m.taskName
            }))
          };
        } else {
          results.cloudflare = {
            status: "error",
            error: data.errors || data,
            message: "Error al consultar los modelos de Cloudflare."
          };
        }
      } catch (err: any) {
        results.cloudflare = {
          status: "exception",
          error: err.message || err
        };
      }
    }

    // 3. DIAGNÓSTICO HUGGING FACE
    if (hfToken) {
      try {
        console.log("Consultando modelos populares de Hugging Face (text-to-image)...");
        // Buscamos los modelos text-to-image más populares
        const response = await fetch(
          "https://huggingface.co/api/models?filter=text-to-image&sort=downloads&direction=-1&limit=10",
          {
            headers: {
              'Authorization': `Bearer ${hfToken}`
            }
          }
        );
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          results.huggingface = {
            status: "ok",
            models: data.map((m: any) => ({
              id: m.modelId,
              downloads: m.downloads,
              likes: m.likes
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

    return results;
  })
  .listen(3001);

console.log(`Servidor de Diagnóstico activo en http://localhost:3001`);
console.log(`Visita http://localhost:3001/api/models en Chrome para ver el JSON.`);
