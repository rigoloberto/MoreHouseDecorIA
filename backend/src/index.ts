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
// INICIALIZACIÓN DE ELYSIA
// ==========================================
const app = new Elysia()
  .use(cors())
  .get('/', () => ({ message: "Backend de More House Decor IA está activo y corriendo con Bun + Elysia!" }))

  // 1. LOGIN ADMINISTRADOR
  .post('/api/auth/login', ({ body, set }) => {
    const { username, password } = body as any;
    if (username === 'admin' && password === 'admin123') {
      return {
        success: true,
        token: "session_token_mock_more_house_ia_2026",
        user: { name: "Vladimir Andrey", role: "admin" }
      };
    }
    set.status = 401;
    return { success: false, message: "Credenciales de administrador incorrectas" };
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
      const { image, preferences } = body as { image: string; preferences: any };

      if (!image || !preferences) {
        set.status = 400;
        return { error: "Faltan parámetros requeridos (imagen base64 o preferencias)" };
      }

      const geminiApiKey = process.env.GEMINI_API_KEY;
      const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
      const hfToken = process.env.HF_TOKEN;

      // A. EXTRACCIÓN DE LA IMAGEN EN BASE64 LIMPIA
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      // B. LLAMADA A GEMINI 1.5 FLASH PARA ANÁLISIS Y SELECCIÓN DE CATÁLOGO
      let aiResponseJson: any = null;
      try {
        console.log("Llamando a la API de Gemini...");
        const prompt = `Analiza el diseño interior de la habitación mostrada en la foto adjunta y las siguientes preferencias de rediseño indicadas por el cliente:
- Tipo/Uso de espacio: ${preferences.spaceType}
- Estilo estético deseado: ${preferences.style}
- Paleta de colores preferida: ${preferences.colors}
- Iluminación: ${preferences.lighting}
- Elementos clave a colocar: ${preferences.elements}

Además, tenemos los siguientes productos de nuestro catálogo oficial de "More House S.A." en stock:
${JSON.stringify(catalog.map(p => ({ id: p.id, name: p.name, category: p.category, style: p.style, description: p.description })))}

Genera una respuesta en formato JSON estrictamente válido, sin markdown ni comillas externas adicionales (solo el JSON plano), con la siguiente estructura:
{
  "current_issues": "Breve párrafo detallando los problemas o inconsistencias actuales de iluminación, distribución o paleta de colores en el espacio del cliente.",
  "selected_products": [
    {
      "id": "ID del producto seleccionado del catálogo",
      "name": "Nombre exacto del producto",
      "justification": "Explicación de por qué este mueble encaja en el diseño propuesto y cumple con las preferencias del cliente."
    }
  ],
  "ai_prompt_for_image": "Un prompt en inglés ultra detallado para una IA de generación de imágenes que recree este espacio del cliente completamente transformado en alta resolución bajo el estilo seleccionado (${preferences.style}) y la paleta de colores (${preferences.colors}). Debe incluir detalles específicos como la iluminación y la ubicación de los muebles principales recomendados."
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
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
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
          aiResponseJson = JSON.parse(cleanText);
          console.log("Gemini respondió y se parseó exitosamente!");
        } else {
          throw new Error(data.error?.message || "Respuesta vacía o error en la respuesta de Gemini API");
        }
      } catch (err: any) {
        console.error("Error llamando a Gemini, usando Fallback:", err.message || err);
        aiResponseJson = {
          current_issues: "Se está utilizando el diseño sugerido basado en tus preferencias y catálogo.",
          selected_products: [
            { id: catalog[0].id, name: catalog[0].name, justification: "Sofá sugerido por defecto para renovar la comodidad de la sala." }
          ],
          ai_prompt_for_image: `A beautifully designed ${preferences.spaceType} in ${preferences.style} style, clean layouts, soft ambient lighting, modern aesthetic decoration.`
        };
      }

      // C. GENERACIÓN DE IMAGEN DE IA CON STABLE DIFFUSION
      let generatedImageBase64 = "";
      const imagePrompt = aiResponseJson.ai_prompt_for_image || `A modern ${preferences.style} ${preferences.spaceType}, luxury furniture, architectural digest photography, 8k resolution`;

      // Intentar con Cloudflare Workers AI
      if (cfAccountId && cfApiToken) {
        try {
          console.log("Generando imagen con Cloudflare Workers AI...");
          const cfResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${cfApiToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                prompt: imagePrompt
              })
            }
          );

          if (cfResponse.ok) {
            const blob = await cfResponse.arrayBuffer();
            const buffer = Buffer.from(blob);
            generatedImageBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
            console.log("Imagen generada exitosamente con Cloudflare!");
          } else {
            console.warn("Fallo de API de Cloudflare, código:", cfResponse.status);
          }
        } catch (err: any) {
          console.error("Error llamando a Cloudflare AI:", err.message || err);
        }
      }

      // Intentar con Hugging Face si falló Cloudflare o si no estaba configurado
      if (!generatedImageBase64 && hfToken) {
        try {
          console.log("Generando imagen con Hugging Face Inference API...");
          const hfResponse = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${hfToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ inputs: imagePrompt })
            }
          );

          if (hfResponse.ok) {
            const blob = await hfResponse.arrayBuffer();
            const buffer = Buffer.from(blob);
            generatedImageBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
            console.log("Imagen generada exitosamente con Hugging Face (FLUX.1)!");
          } else {
            console.warn("Fallo de API de Hugging Face, código:", hfResponse.status);
          }
        } catch (err: any) {
          console.error("Error llamando a Hugging Face API:", err.message || err);
        }
      }

      // Si ambos fallaron, devolver una imagen del stock basada en el catálogo o una por defecto
      if (!generatedImageBase64) {
        console.log("Usando imagen fallback de alta calidad.");
        generatedImageBase64 = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200";
      }

      // D. AGREGAR DETALLES COMPLETOS DE LOS PRODUCTOS SELECCIONADOS
      const selectedProductsDetails = (aiResponseJson.selected_products || []).map((item: any) => {
        const match = catalog.find(p => p.id === item.id || p.name.toLowerCase().includes(item.name.toLowerCase()));
        return {
          ...item,
          details: match || null
        };
      });

      return {
        current_issues: aiResponseJson.current_issues || "Diseño sugerido.",
        prompt: imagePrompt,
        generated_image: generatedImageBase64,
        selected_products: selectedProductsDetails
      };
    } catch (err: any) {
      console.error("CRITICAL ERROR IN GENERATE ROUTE:", err);
      set.status = 500;
      return { error: "Error interno del servidor", details: err.message || err };
    }
  })

  // LISTEN
  .listen(process.env.PORT || 3000);

console.log(`Servidor activo corriendo en http://localhost:${app.server?.port}`);
