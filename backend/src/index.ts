import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';

// Web Crypto SHA-256 hash helper compatible with both Bun and Cloudflare Workers
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    try {
      const db = (env as any).DB;
      const { results } = await db.prepare("SELECT * FROM catalog").all();
      return results;
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

      // Cargar catálogo desde D1
      let activeCatalog: Product[] = [];
      try {
        const db = (env as any).DB;
        const { results } = await db.prepare("SELECT * FROM catalog").all();
        activeCatalog = results as any[];
      } catch (e: any) {
        console.error("Fallo al cargar catálogo de D1 en /api/generate:", e);
        set.status = 500;
        return { error: "Error al obtener catálogo de D1", details: e.message };
      }

      // A. OBTENER IMAGEN DE HABITACIÓN EN FORMATO BLOB Y BASE64 PARA GEMINI
      let roomBlob: Blob;
      let base64Data = "";
      if (image.startsWith('data:')) {
        base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const roomBuffer = Buffer.from(base64Data, "base64");
        roomBlob = new Blob([roomBuffer], { type: "image/jpeg" });
      } else {
        console.log(`Descargando imagen de habitación desde URL: ${image}`);
        let fetchUrl = image;
        if (image.startsWith('/')) {
          fetchUrl = `http://localhost:3000${image}`;
        }
        const imgResponse = await fetch(fetchUrl);
        if (!imgResponse.ok) {
          throw new Error(`Fallo de descarga de habitación base desde ${fetchUrl}: HTTP ${imgResponse.status}`);
        }
        const imgBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(imgBuffer);
        base64Data = buffer.toString("base64");
        roomBlob = new Blob([imgBuffer], { type: "image/jpeg" });
      };

      // B. ENLACE DE PREFERENCIAS
      const spaceType = preferences.spaceType || "Sala";
      const style = preferences.style || "Minimalista";
      const colors = preferences.colors || "Tonos neutros";
      const lighting = preferences.lighting || "Iluminación natural";
      const customText = preferences.customText || "";

      // Listado de productos seleccionados manualmente
      const manualProductIds = selectedProductIds || [];
      const selectedProductsManual = activeCatalog.filter(p => manualProductIds.includes(p.id));
      const manualProductsStr = selectedProductsManual.map(p => 
        `- [ID: ${p.id}] ${p.name} (${p.category}): ${p.description}. Precio: $${p.price}. Medidas: ${p.dimensions}`
      ).join("\n");

      // C. PROMPT PARA GEMINI (CLASIFICACIÓN Y AUTOCURACIÓN)
      const prompt = `Analiza la imagen de la habitación adjunta (input_image_0) y las siguientes especificaciones de diseño:
- Tipo de espacio: ${spaceType}
- Estilo estético deseado: ${style}
- Paleta cromática deseada: ${colors}
- Iluminación: ${lighting}
- Instrucciones especiales del usuario (muebles extras, presupuesto, etc.): "${customText}"

Tenemos el siguiente catálogo oficial de productos de "More House S.A.":
${JSON.stringify(activeCatalog.map(p => ({ id: p.id, name: p.name, category: p.category, style: p.style, price: p.price, description: p.description, dimensions: p.dimensions })))}

Tu tarea es:
1. Si el usuario ha seleccionado productos manualmente, debes colocarlos de forma obligatoria en el diseño. Los productos seleccionados manualmente son:
${manualProductsStr || "Ninguno (Selección automática activa)"}

2. Si el usuario no seleccionó productos manualmente, o seleccionó menos de 3, debes elegir de manera inteligente productos adicionales de nuestro catálogo que complementen el espacio de acuerdo a las especificaciones y presupuesto del cliente, hasta tener un máximo de 3 productos en total.
3. Justifica brevemente la colocación de cada producto.
4. Genera un prompt en inglés ultra-descriptivo para el generador de imágenes FLUX.2 con soporte multi-referencia. En el prompt, debes asociar de forma directa cada producto a su índice de imagen física:
   - input_image_0: Es el cuarto de fondo (el cual puede ser un cuarto vacío original o un render decorado en un turno anterior).
   - input_image_1: Es el primer producto recomendado/seleccionado del catálogo.
   - input_image_2: Es el segundo producto recomendado/seleccionado del catálogo (si existe).
   - input_image_3: Es el tercer producto recomendado/seleccionado del catálogo (si existe).
   
   En el prompt en inglés, describe detalladamente cómo colocar de forma fotorrealista los muebles de input_image_1, input_image_2 y input_image_3 en la habitación base de input_image_0 (por ejemplo: "using input_image_0 as base room layout, place the sofa from input_image_1 against the wall, place the table from input_image_2 in front of the sofa..."). Asegúrate de indicar que los muebles de input_image_1, input_image_2 e input_image_3 deben integrarse perfectamente en perspectiva, iluminación, materiales y sombras con la habitación de input_image_0.
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
      let aiResponseJson: any = null;
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
                      }
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
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
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
        console.error("Todos los modelos de curación fallaron. Usando recomendación por defecto.");
        const fallbackSelected = selectedProductsManual.length > 0 
          ? selectedProductsManual 
          : (activeCatalog.length > 0 ? [activeCatalog[0]] : []);
        
        let fallbackPrompt = `A beautifully designed ${spaceType} in ${style} style, matching color palette ${colors} with ${lighting}. Using input_image_0 as base room layout, `;
        fallbackSelected.forEach((prod, index) => {
          fallbackPrompt += `place the '${prod.name}' from input_image_${index + 1} against the wall or in a designated area matching the room's perspective and lighting. `;
        });
        fallbackPrompt += `Ensure all added furniture (${fallbackSelected.map((_, i) => `input_image_${i + 1}`).join(', ')}) integrates perfectly with shadows, textures and perspective into input_image_0.`;

        aiResponseJson = {
          current_issues: "Se utiliza el diseño sugerido basado en tus preferencias debido a alta demanda en los servidores de Gemini. Tus productos seleccionados siguen estando vinculados como referencias físicas.",
          selected_products: fallbackSelected.map(p => ({ id: p.id, name: p.name, justification: "Mueble seleccionado para renovar el espacio." })),
          ai_prompt_for_image: fallbackPrompt
        };
      }

      // D. CONSOLIDACIÓN DE PRODUCTOS A GENERAR
      const selectedList: Product[] = [];
      for (const item of aiResponseJson.selected_products || []) {
        const match = activeCatalog.find(p => p.id === item.id || p.name.toLowerCase().includes(item.name.toLowerCase()));
        if (match && !selectedList.some(s => s.id === match.id)) {
          selectedList.push(match);
        }
      }

      // Si por alguna razón Gemini no devolvió los seleccionados del usuario, los inyectamos a la fuerza
      for (const p of selectedProductsManual) {
        if (!selectedList.some(s => s.id === p.id)) {
          selectedList.push(p);
        }
      }

      // Limitamos a máximo 3 productos para no exceder las referencias de Cloudflare
      const finalProductsToRender = selectedList.slice(0, 3);
      const imagePrompt = aiResponseJson.ai_prompt_for_image || `A modern ${style} ${spaceType}, matching furniture, 8k resolution`;

      console.log("\n========================================================");
      console.log("PROMPT GENERADO PARA FLUX.2:");
      console.log(imagePrompt);
      console.log("MUEBLES REFERENCIADOS EN IMAGEN:");
      console.log(finalProductsToRender.map(p => p.name).join(", ") || "Ninguno");
      console.log("========================================================\n");

      // E. CONSTRUCCIÓN DE FORM-DATA PARA CLOUDFLARE MULTI-REFERENCIA
      const formData = new FormData();
      formData.append("prompt", imagePrompt);

      // input_image_0 (Cuarto actual)
      formData.append("input_image_0", roomBlob, "room.jpg");

      // input_image_1, input_image_2, input_image_3 (Productos)
      for (let i = 0; i < finalProductsToRender.length; i++) {
        const prod = finalProductsToRender[i];
        try {
          console.log(`Descargando imagen del producto ${prod.name} desde: ${prod.image}`);
          const imgResponse = await fetch(prod.image);
          if (imgResponse.ok) {
            const imgBuffer = await imgResponse.arrayBuffer();
            const imgBlob = new Blob([imgBuffer], { type: "image/jpeg" });
            formData.append(`input_image_${i + 1}`, imgBlob, `prod_${prod.id}.jpg`);
          } else {
            console.warn(`Fallo de descarga de imagen para el producto ${prod.id}, HTTP status: ${imgResponse.status}`);
          }
        } catch (e: any) {
          console.error(`Error al descargar imagen del producto ${prod.id}:`, e);
        }
      }

      // F. INFERENCIA EN CLOUDFLARE WORKERS AI
      let generatedImage = "";
      const mode = qualityMode || "speed";
      const modelName = mode === "quality" 
        ? "@cf/black-forest-labs/flux-2-dev" 
        : "@cf/black-forest-labs/flux-2-klein-9b";

      if (cfAccountId && cfApiToken) {
        try {
          console.log(`Llamando a Cloudflare Workers AI (${modelName}) con multipart/form-data...`);
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
              const jsonResult = await cfResponse.json() as any;
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

      // G. FALLBACK A HUGGING FACE (FLUX.1 SCHNELL TEXT-TO-IMAGE) SI FALLA CLOUDFLARE
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

      // H. FALLBACK FINAL: IMAGEN POR DEFECTO
      if (!generatedImage) {
        console.log("Todos los generadores fallaron. Usando imagen por defecto.");
        generatedImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200";
      }

      // I. DEVOLVER DETALLES COMPLETOS DE LOS PRODUCTOS UTILIZADOS
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


