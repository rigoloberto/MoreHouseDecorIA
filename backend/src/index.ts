import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';

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

let catalog: Product[] = [
  {
    id: "prod-1",
    name: "Sofá Modular Manta",
    category: "Sala",
    style: "Minimalista",
    price: 1250,
    dimensions: "280 x 100 x 75 cm",
    description: "Sofá de tres módulos tapizado en lino texturizado repelente a manchas. Diseño bajo y moderno.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-2",
    name: "Mesa de Centro Nido Alba",
    category: "Sala",
    style: "Moderno",
    price: 320,
    dimensions: "Diámetro 80 cm / 60 cm",
    description: "Juego de dos mesas nido con superficie de chapa de roble y estructura metálica color negro mate.",
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-3",
    name: "Mesa de Comedor Roble Nórdico",
    category: "Comedor",
    style: "Minimalista",
    price: 850,
    dimensions: "200 x 95 x 75 cm",
    description: "Mesa para 8 personas fabricada en madera maciza de roble con acabado natural encerado.",
    image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-4",
    name: "Silla de Comedor Cuero Viena",
    category: "Comedor",
    style: "Elegante",
    price: 180,
    dimensions: "50 x 55 x 85 cm",
    description: "Silla ergonómica tapizada en cuero sintético premium color caramelo, patas de metal negro.",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-5",
    name: "Lámpara de Pie Cobre Arco",
    category: "Sala",
    style: "Industrial",
    price: 290,
    dimensions: "Altura 200 cm (Brazo extendido)",
    description: "Lámpara de arco de acero cepillado con pantalla de cobre. Base de mármol negro pesado.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-6",
    name: "Escritorio de Madera y Hierro Fénix",
    category: "Oficina",
    style: "Industrial",
    price: 450,
    dimensions: "140 x 60 x 75 cm",
    description: "Escritorio rústico con madera reciclada tratada y patas de soporte en hierro forjado estructural.",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-7",
    name: "Silla Ergonómica Aero",
    category: "Oficina",
    style: "Moderno",
    price: 350,
    dimensions: "65 x 65 x 115-125 cm",
    description: "Silla giratoria de oficina con soporte lumbar activo, malla transpirable 3D y brazos 4D ajustables.",
    image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-8",
    name: "Aparador Nogal Imperial",
    category: "Comedor",
    style: "Lujo",
    price: 1100,
    dimensions: "180 x 45 x 80 cm",
    description: "Aparador trinchador de madera de nogal con detalles de puertas de vidrio templado y tiradores de latón.",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-9",
    name: "Poltrona Terciopelo Jade",
    category: "Sala",
    style: "Elegante",
    price: 480,
    dimensions: "85 x 80 x 90 cm",
    description: "Butaca de acento tapizada en terciopelo verde esmeralda con patas metálicas doradas.",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-10",
    name: "Consola Mármol Carrara",
    category: "Sala",
    style: "Lujo",
    price: 750,
    dimensions: "120 x 35 x 75 cm",
    description: "Consola de entrada minimalista de alta gama con cubierta de mármol Carrara pulido y patas doradas.",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=400"
  }
];

// ==========================================
// INICIALIZACIÓN DE ELYSIA Y ESTADÍSTICAS REALES
// ==========================================
// Generamos el hash seguro de la contraseña administrador al arrancar el servidor
const ADMIN_PASSWORD_HASH = Bun.password.hashSync("admin123");

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

const app = new Elysia()
  .use(cors())
  .get('/', () => ({ message: "Backend de More House Decor IA está activo y corriendo con Bun + Elysia!" }))

  // 1. LOGIN ADMINISTRADOR
  .post('/api/auth/login', async ({ body, set }) => {
    const { username, password } = body as any;
    
    // Verificación segura usando el hash de Bun (bcrypt/argon2 nativo en Zig)
    const isPasswordCorrect = await Bun.password.verify(password, ADMIN_PASSWORD_HASH);
    
    if (username === 'admin' && isPasswordCorrect) {
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
  .get('/api/stats', () => {
    return {
      totalGenerations,
      totalQuotes,
      styleStats,
      totalProducts: catalog.length
    };
  })

  .post('/api/stats/quote', () => {
    totalQuotes++;
    return { success: true, totalQuotes };
  })

  // 2. CRUD DEL CATÁLOGO DE PRODUCTOS
  .get('/api/catalog', () => catalog)
  
  .post('/api/catalog', ({ body, set }) => {
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
    catalog.push(newProduct);
    return { success: true, product: newProduct };
  })

  .put('/api/catalog/:id', ({ params, body, set }) => {
    const index = catalog.findIndex(p => p.id === params.id);
    if (index === -1) {
      set.status = 404;
      return { error: "Producto no encontrado" };
    }
    const updated = body as Partial<Product>;
    catalog[index] = {
      ...catalog[index],
      ...updated,
      price: updated.price ? Number(updated.price) : catalog[index].price
    };
    return { success: true, product: catalog[index] };
  })

  .delete('/api/catalog/:id', ({ params, set }) => {
    const index = catalog.findIndex(p => p.id === params.id);
    if (index === -1) {
      set.status = 404;
      return { error: "Producto no encontrado" };
    }
    const deleted = catalog.splice(index, 1);
    return { success: true, deleted: deleted[0] };
  })

  // 3. GENERADOR DE DISEÑO POR IA (PROCESAMIENTO)
  .post('/api/generate', async ({ body, set }) => {
    try {
      const { image, preferences, selectedProductIds, qualityMode } = body as { 
        image: string; 
        preferences: any; 
        selectedProductIds?: string[];
        qualityMode?: string;
      };

      if (!image || !preferences) {
        set.status = 400;
        return { error: "Faltan parámetros requeridos (imagen base64 o preferencias)" };
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

      // A. EXTRACCIÓN DE LA IMAGEN EN BASE64 LIMPIA
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      // B. ENLACE DE PREFERENCIAS
      const spaceType = preferences.spaceType || "Sala";
      const style = preferences.style || "Minimalista";
      const colors = preferences.colors || "Tonos neutros";
      const lighting = preferences.lighting || "Iluminación natural";
      const customText = preferences.customText || "";

      // Listado de productos seleccionados manualmente
      const manualProductIds = selectedProductIds || [];
      const selectedProductsManual = catalog.filter(p => manualProductIds.includes(p.id));
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
${JSON.stringify(catalog.map(p => ({ id: p.id, name: p.name, category: p.category, style: p.style, price: p.price, description: p.description, dimensions: p.dimensions })))}

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
          : [catalog[0]];
        
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
        const match = catalog.find(p => p.id === item.id || p.name.toLowerCase().includes(item.name.toLowerCase()));
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
      const roomBuffer = Buffer.from(base64Data, "base64");
      const roomBlob = new Blob([roomBuffer], { type: "image/jpeg" });
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
  })

  // LISTEN
  .listen(process.env.PORT || 3000);

console.log(`Servidor activo corriendo en http://localhost:${app.server?.port}`);
