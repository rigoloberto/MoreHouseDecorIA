import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';

// Web Crypto SHA-256 hash helper compatible with both Bun and Cloudflare Workers
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper para leer archivos directamente de R2 o descargarlos vía HTTP
async function getFileBuffer(url: string, bucket: any): Promise<ArrayBuffer | null> {
  const r2Match = url.match(/\/api\/files\/([^?#\/]+)/);
  if (r2Match && bucket) {
    const key = decodeURIComponent(r2Match[1]);
    console.log(`[R2 Helper] Leyendo directamente de R2: ${key}`);
    const object = await bucket.get(key);
    if (object) {
      return await object.arrayBuffer();
    }
    console.warn(`[R2 Helper] Clave no encontrada en R2: ${key}`);
  }
  
  let fetchUrl = url;
  if (url.startsWith('/')) {
    fetchUrl = `http://localhost:3000${url}`;
  }
  console.log(`[HTTP Helper] Descargando imagen desde: ${fetchUrl}`);
  try {
    const response = await fetch(fetchUrl);
    if (response.ok) {
      return await response.arrayBuffer();
    }
    console.error(`[HTTP Helper] Error descargando: ${response.status} ${response.statusText}`);
  } catch (e) {
    console.error(`[HTTP Helper] Error al descargar de ${fetchUrl}:`, e.message || e);
  }
  return null;
}


// SHA-256 hash of "admin123"
const ADMIN_PASSWORD_SHA256 = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";


// ==========================================
// CATALOGO DE PRODUCTOS (MOCK DATABASE)
// ==========================================
interface Product {
  id: string;
  name: string;
  category: string;
  style: string;
  price: number;
  description: string;
  dimensions: string;
  image: string; // URL mock
}

// Caché del catálogo en memoria
let cachedCatalog: Product[] | null = null;

// El catálogo heredado en memoria ha sido eliminado. Los datos ahora persisten 100% en D1 SQLite.

// Admin password hash config is loaded statically above


// Contadores en memoria para estadísticas reales de la app
let totalGenerations = 0;
let totalQuotes = 0;
const styleStats: Record<string, number> = {
  "Minimalista": 0,
  "Moderno": 0,
  "Elegante": 0,
  "Lujo": 0,
  "Industrial": 0
};

const app = new Elysia({ aot: false })
  .use(cors())
  .get('/', () => ({ message: "Backend de More House Decor IA está activo y corriendo con Bun + Elysia!" }))

  // 1. LOGIN ADMINISTRADOR
  .post('/api/auth/login', async ({ body, set }) => {
    const { username, password } = body as any;
    
    // Verificación usando Web Crypto SHA-256
    const inputHash = await sha256(password);
    
    if (username === 'admin' && inputHash === ADMIN_PASSWORD_SHA256) {
      return {
        success: true,
        token: "session_token_mock_more_house_ia_2026",
        user: { name: "Vladimir Andrey", role: "admin" }
      };
    }
    set.status = 401;
    return { success: false, message: "Credenciales de administrador incorrectas" };
  })

  // Endpoints para Estadísticas Reales
  .get('/api/stats', async ({ env, set }) => {
    if (!env || !(env as any).DB) {
      set.status = 500;
      return { error: "Base de datos D1 no disponible" };
    }
    let totalProducts = 0;
    try {
      const db = (env as any).DB;
      const countRes = await db.prepare("SELECT COUNT(*) as count FROM catalog").first();
      if (countRes) totalProducts = Number(countRes.count);
    } catch (e) {
      console.warn("Fallo al obtener totalProducts de D1:", e);
    }
    return {
      totalGenerations,
      totalQuotes,
      styleStats,
      totalProducts
    };
  })

  .post('/api/stats/quote', () => {
    totalQuotes++;
    return { success: true, totalQuotes };
  })

  // 2. CRUD DEL CATÁLOGO DE PRODUCTOS
  .get('/api/catalog', async ({ env, set }) => {
    if (!env || !(env as any).DB) {
      set.status = 500;
      return { error: "Base de datos D1 no disponible" };
    }
    if (cachedCatalog) {
      console.log("[Cache] Retornando catálogo desde la caché de memoria.");
      return cachedCatalog;
    }
    try {
      const db = (env as any).DB;
      const { results } = await db.prepare("SELECT * FROM catalog").all();
      cachedCatalog = results as any[];
      return cachedCatalog;
    } catch (err: any) {
      console.error("Error al consultar D1:", err);
      set.status = 500;
      return { error: "Error de base de datos", details: err.message };
    }
  })
  
  .post('/api/catalog', async ({ body, env, set }) => {
    if (!env || !(env as any).DB) {
      set.status = 500;
      return { error: "Base de datos D1 no disponible" };
    }
    const product = body as Partial<Product>;
    if (!product.name || !product.category || !product.style || !product.price) {
      set.status = 400;
      return { error: "Faltan campos requeridos en el producto" };
    }
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: product.name,
      category: product.category,
      style: product.style,
      price: Number(product.price),
      dimensions: product.dimensions || "N/D",
      description: product.description || "",
      image: product.image || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400"
    };

    try {
      const db = (env as any).DB;
      await db.prepare(
        "INSERT INTO catalog (id, name, category, style, price, dimensions, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        newProduct.id, newProduct.name, newProduct.category, newProduct.style, newProduct.price, newProduct.dimensions, newProduct.description, newProduct.image
      ).run();
      cachedCatalog = null; // Invalida la caché al insertar un producto nuevo
      return { success: true, product: newProduct };
    } catch (err: any) {
      console.error("Error al insertar en D1:", err);
      set.status = 500;
      return { error: "Error al guardar en base de datos D1", details: err.message };
    }
  })

  .put('/api/catalog/:id', async ({ params, body, env, set }) => {
    if (!env || !(env as any).DB) {
      set.status = 500;
      return { error: "Base de datos D1 no disponible" };
    }
    const updated = body as Partial<Product>;
    const priceVal = updated.price ? Number(updated.price) : undefined;

    try {
      const db = (env as any).DB;
      await db.prepare(
        "UPDATE catalog SET name = COALESCE(?, name), category = COALESCE(?, category), style = COALESCE(?, style), price = COALESCE(?, price), dimensions = COALESCE(?, dimensions), description = COALESCE(?, description), image = COALESCE(?, image) WHERE id = ?"
      ).bind(
        updated.name || null, updated.category || null, updated.style || null, priceVal !== undefined ? priceVal : null, updated.dimensions || null, updated.description || null, updated.image || null, params.id
      ).run();
      
      const product = await db.prepare("SELECT * FROM catalog WHERE id = ?").bind(params.id).first();
      if (!product) {
        set.status = 404;
        return { error: "Producto no encontrado" };
      }
      cachedCatalog = null; // Invalida la caché al actualizar un producto
      return { success: true, product };
    } catch (err: any) {
      console.error("Error al actualizar en D1:", err);
      set.status = 500;
      return { error: "Error al actualizar en base de datos D1", details: err.message };
    }
  })

  .delete('/api/catalog/:id', async ({ params, env, set }) => {
    if (!env || !(env as any).DB) {
      set.status = 500;
      return { error: "Base de datos D1 no disponible" };
    }
    try {
      const db = (env as any).DB;
      const product = await db.prepare("SELECT * FROM catalog WHERE id = ?").bind(params.id).first();
      if (!product) {
        set.status = 404;
        return { error: "Producto no encontrado" };
      }
      await db.prepare("DELETE FROM catalog WHERE id = ?").bind(params.id).run();
      cachedCatalog = null; // Invalida la caché al eliminar un producto
      return { success: true, deleted: product };
    } catch (err: any) {
      console.error("Error al eliminar en D1:", err);
      set.status = 500;
      return { error: "Error al eliminar en base de datos D1", details: err.message };
    }
  })
  // 3. GENERADOR DE DISEÑO POR IA (PROCESAMIENTO)
  .post('/api/generate', async ({ body, env, set }) => {
    try {
      const { image, preferences, selectedProductIds, qualityMode } = body as { 
        image: string; 
        preferences: any; 
        selectedProductIds?: string[];
        qualityMode?: string;
      };

      if (!env || !(env as any).DB) {
        set.status = 500;
        return { error: "Base de datos D1 no disponible" };
      }

      // Incrementar estadísticas reales de uso
      totalGenerations++;
      if (preferences.style && preferences.style in styleStats) {
        styleStats[preferences.style]++;
      }

      const geminiApiKey = process.env.GEMINI_API_KEY;
      const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
      const hfToken = process.env.HF_TOKEN;
      const bucket = (env as any).BUCKET;

      // Cargar catálogo desde D1 (utilizar caché si está disponible)
      let activeCatalog: Product[] = [];
      try {
        if (cachedCatalog) {
          console.log("[Cache] Usando catálogo cacheado en /api/generate");
          activeCatalog = cachedCatalog;
        } else {
          console.log("[D1] Cargando catálogo de base de datos en /api/generate");
          const db = (env as any).DB;
          const { results } = await db.prepare("SELECT * FROM catalog").all();
          activeCatalog = results as any[];
          cachedCatalog = activeCatalog; // Guardar en caché
        }
      } catch (e: any) {
        console.error("Fallo al cargar catálogo de D1 en /api/generate:", e);
        set.status = 500;
        return { error: "Error al obtener catálogo de D1", details: e.message };
      }

      // A. OBTENER IMAGEN DE HABITACIÓN EN FORMATO BLOB Y BASE64 PARA GEMINI
      let roomBuffer: ArrayBuffer | null = null;
      if (image.startsWith('data:')) {
        const base64 = image.replace(/^data:image\/\w+;base64,/, "");
        roomBuffer = Buffer.from(base64, "base64");
      } else {
        roomBuffer = await getFileBuffer(image, bucket);
      }

      if (!roomBuffer) {
        set.status = 400;
        return { error: "No se pudo obtener la imagen de la habitación base" };
      }
      
      const roomBlob = new Blob([roomBuffer], { type: "image/jpeg" });
      const base64Data = Buffer.from(roomBuffer).toString("base64");

      // B. ENLACE DE PREFERENCIAS
      const spaceType = preferences.spaceType || "Sala";
      const style = preferences.style || "Minimalista";
      const colors = preferences.colors || "Tonos neutros";
      const lighting = preferences.lighting || "Iluminación natural";
      const customText = preferences.customText || "";

      // Listado de productos seleccionados manualmente
      const manualProductIds = selectedProductIds || [];
      const selectedProductsManual = activeCatalog.filter(p => manualProductIds.includes(p.id));

      // C. PRE-SELECCIONAR PRODUCTOS A RENDERIZAR
      const selectedList: Product[] = [...selectedProductsManual];
      if (selectedList.length < 3) {
        const remainingSlots = 3 - selectedList.length;
        const availableCatalog = activeCatalog.filter(p => !selectedList.some(s => s.id === p.id));
        
        let recommended = availableCatalog.filter(p => p.style.toLowerCase() === style.toLowerCase());
        if (recommended.length < remainingSlots) {
          const otherStyle = availableCatalog.filter(p => p.style.toLowerCase() !== style.toLowerCase());
          recommended = [...recommended, ...otherStyle];
        }
        selectedList.push(...recommended.slice(0, remainingSlots));
      }
      const finalProductsToRender = selectedList.slice(0, 3);

      // D. DESCARGAR IMÁGENES DE LOS PRODUCTOS PARA PASARLAS A GEMINI
      const productImagesData = [];
      const productDescriptionsText = [];

      for (let i = 0; i < finalProductsToRender.length; i++) {
        const prod = finalProductsToRender[i];
        productDescriptionsText.push(
          `- [input_image_${i + 1}]: Mueble "${prod.name}" (${prod.category}). Estilo: ${prod.style}. Medidas: ${prod.dimensions}. Descripción: ${prod.description}`
        );
        
        try {
          const imgBuffer = await getFileBuffer(prod.image, bucket);
          if (imgBuffer) {
            const mimeType = "image/jpeg";
            const base64 = Buffer.from(imgBuffer).toString("base64");
            productImagesData.push({
              inlineData: {
                mimeType,
                data: base64
              }
            });
          }
        } catch (e) {
          console.error(`Error al procesar imagen del producto ${prod.id} para Gemini:`, e);
        }
      }

      // E. PROMPT PARA GEMINI (CLASIFICACIÓN Y REDACCIÓN TEXT-TO-IMAGE DE ALTA FIDELIDAD)
      const prompt = `Analiza la imagen de la habitación adjunta (la primera imagen, que llamaremos la habitación base o input_image_0) y las fotos de los productos del catálogo adjuntas a continuación.
Especificaciones del espacio y preferencias:
- Tipo de espacio: ${spaceType}
- Estilo estético deseado: ${style}
- Paleta cromática deseada: ${colors}
- Iluminación: ${lighting}
- Instrucciones especiales del usuario: "${customText}"

Productos seleccionados del catálogo para colocar en el diseño:
${productDescriptionsText.length > 0 ? productDescriptionsText.join("\n") : "Ninguno"}

Las imágenes adjuntas están en este orden exacto:
1. Habitación base (input_image_0)
${finalProductsToRender.map((prod, index) => `${index + 2}. Imagen del producto "${prod.name}" (input_image_${index + 1})`).join("\n")}

Tu tarea es:
1. Evaluar el espacio y detallar los problemas reales que se solucionan en este paso de diseño (distribución, colores, combinación).
2. Escribir una justificación convincente de cómo y dónde se integra cada producto en el espacio.
3. Generar un prompt en inglés ultra-descriptivo para el generador de imágenes FLUX.2.
   
   IMPORTANTE PARA EL PROMPT DE FLUX.2:
   En tu prompt final en inglés, debes describir detalladamente cómo colocar de forma fotorrealista los muebles de input_image_1, input_image_2 y input_image_3 en la habitación base de input_image_0 (por ejemplo: "using input_image_0 as base room layout, place the sofa from input_image_1 against the wall, place the table from input_image_2 in front of the sofa..."). 
   Debes asociar de forma directa cada producto a su índice de imagen física:
   - input_image_0: Es el cuarto de fondo (el cual puede ser un cuarto vacío original o un render decorado en un turno anterior).
   - input_image_1: Es el primer producto recomendado/seleccionado del catálogo.
   - input_image_2: Es el segundo producto recomendado/seleccionado del catálogo (si existe).
   - input_image_3: Es el tercer producto recomendado/seleccionado del catálogo (si existe).
   
   Asegúrate de indicar que los muebles de input_image_1, input_image_2 e input_image_3 deben integrarse perfectamente en perspectiva, iluminación, materiales y sombras con la habitación de input_image_0.
   También describe de forma genérica en texto cualquier elemento adicional que el usuario haya pedido y que NO esté en el catálogo (ej. cortinas, papel tapiz, plantas decorativas, piso).

Genera una respuesta en formato JSON estrictamente válido, sin markdown ni comillas externas adicionales (solo el JSON plano), con la siguiente estructura:
{
  "current_issues": "Detalle de los problemas de distribución, iluminación o colores que se solucionan en este paso de diseño.",
  "selected_products": [
    {
      "id": "ID del producto de catálogo",
      "name": "Nombre exacto del producto",
      "justification": "Explicación de cómo y por qué se integra este mueble en la habitación."
    }
  ],
  "ai_prompt_for_image": "El prompt de imagen en inglés estructurado con referencias input_image_1..3."
}`;

      // Llamada a Gemini con encadenamiento de fallbacks
      let aiResponseJson = null;
      const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-3.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-flash-latest"
      ];
      let geminiSuccess = false;
      let lastGeminiError = "";

      for (const modelName of modelsToTry) {
        try {
          console.log(`Llamando a Gemini para curación usando el modelo ${modelName}...`);
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: prompt },
                      {
                        inlineData: {
                          mimeType: 'image/jpeg',
                          data: base64Data
                        }
                      },
                      ...productImagesData
                    ]
                  }
                ],
                generationConfig: {
                  responseMimeType: 'application/json'
                }
              })
            }
          );

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error?.message || `HTTP ${response.status}`);
          }

          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const cleanText = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
            aiResponseJson = JSON.parse(cleanText);
            console.log(`¡Gemini curó los productos con éxito usando ${modelName}!`);
            geminiSuccess = true;
            break;
          } else {
            throw new Error("Respuesta vacía de la API");
          }
        } catch (err: any) {
          console.warn(`Fallo con el modelo de curación ${modelName}: ${err.message || err}. Probando el siguiente...`);
          lastGeminiError = err.message || err;
        }
      }

      if (!geminiSuccess) {
        console.error("Todos los modelos de curación fallaron. Último error:", lastGeminiError);
        let fallbackPrompt = `A beautifully designed ${spaceType} in ${style} style, matching color palette ${colors} with ${lighting}. Using input_image_0 as base room layout, `;
        finalProductsToRender.forEach((prod, index) => {
          fallbackPrompt += `place the '${prod.name}' from input_image_${index + 1} against the wall or in a designated area matching the room's perspective and lighting. `;
        });
        fallbackPrompt += `Ensure all added furniture (${finalProductsToRender.map((_, i) => `input_image_${i + 1}`).join(', ')}) integrates perfectly with shadows, textures and perspective into input_image_0.`;

        aiResponseJson = {
          current_issues: "Se utiliza el diseño sugerido basado en tus preferencias debido a alta demanda en los servidores de Gemini. Tus productos seleccionados siguen estando vinculados como referencias físicas.",
          selected_products: finalProductsToRender.map(p => ({ id: p.id, name: p.name, justification: "Mueble seleccionado para renovar el espacio." })),
          ai_prompt_for_image: fallbackPrompt
        };
      }

      const imagePrompt = aiResponseJson.ai_prompt_for_image || `A modern ${style} ${spaceType}, matching furniture, 8k resolution`;

      console.log("\n========================================================");
      console.log("PROMPT GENERADO PARA FLUX.2:");
      console.log(imagePrompt);
      console.log("MUEBLES REFERENCIADOS EN IMAGEN:");
      console.log(finalProductsToRender.map(p => p.name).join(", ") || "Ninguno");
      console.log("========================================================\n");

      // F. CONSTRUCCIÓN DE FORM-DATA PARA CLOUDFLARE MULTI-REFERENCIA
      const formData = new FormData();
      formData.append("prompt", imagePrompt);
      formData.append("input_image_0", roomBlob, "room.jpg");

      // input_image_1, input_image_2, input_image_3 (Productos)
      for (let i = 0; i < finalProductsToRender.length; i++) {
        const prod = finalProductsToRender[i];
        try {
          const imgBuffer = await getFileBuffer(prod.image, bucket);
          if (imgBuffer) {
            const imgBlob = new Blob([imgBuffer], { type: "image/jpeg" });
            formData.append(`input_image_${i + 1}`, imgBlob, `prod_${prod.id}.jpg`);
            console.log(`Adjuntada imagen de producto ${prod.name} (input_image_${i + 1}) al FormData de Cloudflare.`);
          }
        } catch (e: any) {
          console.error(`Error al adjuntar imagen de producto ${prod.id} a Cloudflare:`, e);
        }
      }

      // G. INFERENCIA EN CLOUDFLARE WORKERS AI (MULTIPLE REFERENCE)
      let generatedImage = "";
      const mode = qualityMode || "quality";
      let modelName = "@cf/black-forest-labs/flux-2-dev";
      if (mode === "sketch") {
        modelName = "@cf/black-forest-labs/flux-2-klein-4b";
      } else if (mode === "speed") {
        modelName = "@cf/black-forest-labs/flux-2-klein-9b";
      }

      if (cfAccountId && cfApiToken) {
        try {
          console.log(`Llamando a Cloudflare Workers AI (${modelName}) con FormData (multi-reference)...`);
          const cfResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${modelName}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${cfApiToken}`
              },
              body: formData
            }
          );

          if (cfResponse.ok) {
            const contentType = cfResponse.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              const jsonResult = await cfResponse.json();
              const base64Image = jsonResult.result?.image;
              if (base64Image) {
                generatedImage = `data:image/jpeg;base64,${base64Image}`;
              } else {
                console.warn("La respuesta JSON de Cloudflare no contiene 'result.image'");
              }
            } else {
              const arrayBuffer = await cfResponse.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const textSample = buffer.subarray(0, 100).toString('utf-8').trim();
              if (textSample.startsWith('{') || textSample.startsWith('[')) {
                try {
                  const jsonResult = JSON.parse(buffer.toString('utf-8'));
                  const base64Image = jsonResult.result?.image;
                  if (base64Image) {
                    generatedImage = `data:image/jpeg;base64,${base64Image}`;
                  } else {
                    console.warn("La respuesta JSON parseada de Cloudflare no contiene 'result.image'");
                  }
                } catch (e) {
                  generatedImage = `data:image/png;base64,${buffer.toString('base64')}`;
                }
              } else {
                generatedImage = `data:image/png;base64,${buffer.toString('base64')}`;
              }
            }
            console.log("¡Generación en Cloudflare exitosa!");
          } else {
            const errMsg = await cfResponse.text();
            console.warn(`Fallo en la API de Cloudflare Workers AI: ${cfResponse.status} - ${errMsg}`);
          }
        } catch (err: any) {
          console.error("Error llamando a Cloudflare AI:", err.message || err);
        }
      }

      // H. FALLBACK A HUGGING FACE (FLUX.1 SCHNELL TEXT-TO-IMAGE) SI FALLA CLOUDFLARE
      if (!generatedImage && hfToken) {
        try {
          console.log("Hugging Face Inference API (Fallback FLUX.1 Text-to-Image)...");
          const hfResponse = await fetch(
            "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${hfToken}`,
                'Content-Type': 'application/json',
                'User-Agent': 'MoreHouseDecorIA/1.0'
              },
              body: JSON.stringify({ inputs: imagePrompt })
            }
          );

          if (hfResponse.ok) {
            const blob = await hfResponse.arrayBuffer();
            const buffer = Buffer.from(blob);
            generatedImage = `data:image/png;base64,${buffer.toString('base64')}`;
            console.log("¡Generación en Hugging Face exitosa!");
          } else {
            console.warn("Fallo de API de Hugging Face, código:", hfResponse.status);
          }
        } catch (err: any) {
          console.error("Error llamando a Hugging Face API:", err.message || err);
        }
      }

      // I. FALLBACK FINAL: IMAGEN POR DEFECTO
      if (!generatedImage) {
        console.log("Todos los generadores fallaron. Usando imagen por defecto.");
        generatedImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200";
      }

      // J. DEVOLVER DETALLES COMPLETOS DE LOS PRODUCTOS UTILIZADOS
      const selectedProductsDetails = finalProductsToRender.map((prod) => {
        const item = aiResponseJson.selected_products?.find((item: any) => 
          item.id === prod.id || item.name.toLowerCase().includes(prod.name.toLowerCase())
        );
        return {
          id: prod.id,
          name: prod.name,
          justification: item?.justification || "Mueble de catálogo seleccionado para armar el diseño de la habitación.",
          details: prod
        };
      });

      // Si la imagen generada es un base64 data URL (de Hugging Face o Cloudflare), la guardamos en R2 para que el frontend use una URL corta en LocalStorage
      if (generatedImage.startsWith('data:')) {
        try {
          const mimeType = generatedImage.match(/^data:([^;]+);/)?.[1] || 'image/png';
          const ext = mimeType.split('/')[1] || 'png';
          const base64 = generatedImage.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64, 'base64');
          
          const key = `generated-${Date.now()}.${ext}`;
          console.log(`[R2 Save] Subiendo imagen generada por IA a R2 con clave: ${key}`);
          await bucket.put(key, buffer, {
            httpMetadata: { contentType: mimeType }
          });
          
          // Reemplazar generatedImage con la URL de nuestro servidor de archivos
          generatedImage = `/api/files/${key}`;
        } catch (e: any) {
          console.error("Error al persistir la imagen generada en R2:", e.message || e);
        }
      }

      return {
        current_issues: aiResponseJson.current_issues || "Diseño sugerido.",
        prompt: imagePrompt,
        generated_image: generatedImage,
        selected_products: selectedProductsDetails
      };
    } catch (err: any) {
      console.error("CRITICAL ERROR IN GENERATE ROUTE:", err);
      set.status = 500;
      return { error: "Error interno del servidor", details: err.message || err };
    }
  })

  // 5. CARGA Y SERVICIO DE ARCHIVOS EN R2
  .post('/api/upload', async ({ body, env, set }) => {
    if (!env || !(env as any).BUCKET) {
      set.status = 500;
      return { error: "El almacenamiento R2 no está configurado o vinculado" };
    }
    const { file } = body as { file: File };
    if (!file) {
      set.status = 400;
      return { error: "No se proporcionó ningún archivo" };
    }
    
    try {
      const bucket = (env as any).BUCKET;
      const key = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      
      // Subir el archivo binario a R2
      const arrayBuffer = await file.arrayBuffer();
      await bucket.put(key, arrayBuffer, {
        httpMetadata: { contentType: file.type }
      });
      
      return { 
        success: true, 
        key,
        url: `/api/files/${key}` 
      };
    } catch (e: any) {
      console.error("Error al subir a R2:", e);
      set.status = 500;
      return { error: "Error al guardar archivo en R2", details: e.message };
    }
  }, {
    body: t.Object({
      file: t.File()
    })
  })

  .get('/api/files/:key', async ({ params, env, set }) => {
    if (!env || !(env as any).BUCKET) {
      set.status = 500;
      return { error: "El almacenamiento R2 no está configurado o vinculado" };
    }
    try {
      const bucket = (env as any).BUCKET;
      const object = await bucket.get(params.key);
      if (!object) {
        set.status = 404;
        return { error: "Archivo no encontrado" };
      }
      const buffer = await object.arrayBuffer();
      set.headers['Content-Type'] = object.httpMetadata?.contentType || 'image/jpeg';
      return Buffer.from(buffer);
    } catch (e: any) {
      console.error("Error al leer de R2:", e);
      set.status = 500;
      return { error: "Error al leer archivo de R2", details: e.message };
    }
  })

  // 4. PROXY DE IMÁGENES PARA EVITAR ERRORES DE CORS EN DESCARGAS
  .get('/api/proxy', async ({ query, set }) => {
    const url = query.url;
    if (!url) {
      set.status = 400;
      return { error: "Falta el parámetro url" };
    }
    try {
      if (url.startsWith('data:')) {
        // Si ya es base64, decodificar y retornar
        const matches = url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
        if (matches && matches.length === 3) {
          const contentType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          set.headers['Content-Type'] = contentType;
          return buffer;
        }
      }
      
      console.log(`Descargando imagen proxy desde: ${url}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      set.headers['Content-Type'] = response.headers.get('Content-Type') || 'image/png';
      return buffer;
    } catch (e: any) {
      console.error("Error en proxy de imagen:", e);
      set.status = 500;
      return { error: "Error al hacer proxy de la imagen", details: e.message || e };
    }
  });

// LISTEN
if (typeof Bun !== 'undefined') {
  app.listen(process.env.PORT || 3000);
  console.log(`Servidor activo corriendo en http://localhost:${app.server?.port}`);
}

export default {
  async fetch(request: Request, env: any, ctx: any) {
    return new Elysia({ aot: false })
      .decorate('env', env)
      .use(app)
      .handle(request);
  }
};


