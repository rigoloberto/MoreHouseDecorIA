<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Upload, Sparkles, Image as ImageIcon, ChevronRight, ChevronLeft, RefreshCw, 
  Trash2, Download, Package, Grid, Settings, TrendingUp, Plus, 
  Edit3, LogOut, CheckCircle, Info, DollarSign, Layout, ShieldAlert,
  X, Maximize2, Eye
} from 'lucide-vue-next';
import confetti from 'canvas-confetti';

// ==========================================
// ESTADO GLOBAL Y CONFIGURACIÓN
// ==========================================
const API_URL = 'http://localhost:3000';
const activeTab = ref<'designer' | 'catalog' | 'admin'>('designer');

// Catálogo de productos cargado desde la API
const products = ref<any[]>([]);
const catalogLoading = ref(false);

// Cargar catálogo al iniciar
const fetchCatalog = async () => {
  catalogLoading.value = true;
  try {
    const res = await fetch(`${API_URL}/api/catalog`);
    if (res.ok) {
      products.value = await res.json();
    }
  } catch (err) {
    console.error("Error al conectar con la API de Elysia:", err);
  } finally {
    catalogLoading.value = false;
  }
};

onMounted(() => {
  fetchCatalog();
});

// ==========================================
// ESTADO: DISEÑADOR IA
// ==========================================
const uploadDragOver = ref(false);
const uploadedImage = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Historial de versiones del diseño en esta sesión
const designHistory = ref<any[]>([]);
const activeDesignId = ref<string>('');

const activeDesign = computed(() => {
  return designHistory.value.find(d => d.id === activeDesignId.value) || null;
});

const preferences = ref({
  spaceType: 'Sala',
  style: 'Minimalista',
  colors: 'Tonos neutros y cálidos (Beige, Gris suave, Madera)',
  lighting: 'Luz natural abundante con lámparas cálidas de acento',
  customText: '',
  priority: 'speed' // 'speed' o 'quality'
});

const selectedProductIds = ref<string[]>([]);

// Limitar la selección manual de nuevos productos a máximo 3 por turno
const toggleProductSelection = (id: string) => {
  const idx = selectedProductIds.value.indexOf(id);
  if (idx > -1) {
    selectedProductIds.value.splice(idx, 1);
  } else {
    if (selectedProductIds.value.length >= 3) {
      alert("⚠️ Límite alcanzado: Puedes seleccionar hasta 3 productos por turno para garantizar fotorrealismo real de catálogo. ¡Puedes ir amueblando por etapas!");
      return;
    }
    selectedProductIds.value.push(id);
  }
};

const isProductAlreadyPlaced = (productId: string) => {
  if (!activeDesign.value) return false;
  return activeDesign.value.products.some((p: any) => p.id === productId);
};

const isGenerating = ref(false);
const generationStep = ref(0);
const generationLogs = [
  "Analizando volumetría del espacio y catálogo con Gemini 2.5 Flash...",
  "Mapeando solicitudes semánticas y resolviendo elementos de catálogo...",
  "Descargando imágenes de referencia física de los muebles seleccionados...",
  "Renderizando habitación con fotorrealismo por referencias en Cloudflare Workers AI...",
  "Ajustando perspectivas, sombreado tridimensional e iluminación final..."
];

// Orquestar generación con Backend
const generateDesign = async () => {
  const active = activeDesign.value;
  if (!active) return;

  isGenerating.value = true;
  generationStep.value = 0;

  // Efecto visual de pasos en el loading
  const stepInterval = setInterval(() => {
    if (generationStep.value < generationLogs.length - 1) {
      generationStep.value++;
    }
  }, 2500);

  try {
    const res = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: active.imageUrl,
        preferences: preferences.value,
        selectedProductIds: selectedProductIds.value,
        qualityMode: preferences.value.priority
      })
    });

    if (res.ok) {
      const response = await res.json();
      clearInterval(stepInterval);
      
      // Construir nuevo lote de productos combinando los anteriores con los nuevos de esta etapa
      const prevProducts = active.products || [];
      const mergedProducts = [...prevProducts];
      for (const p of response.selected_products) {
        if (!mergedProducts.some(m => m.id === p.id)) {
          mergedProducts.push(p);
        }
      }

      // Añadir la propuesta al historial
      const newId = `design-${Date.now()}`;
      designHistory.value.push({
        id: newId,
        imageUrl: response.generated_image,
        products: mergedProducts,
        label: `Diseño ${designHistory.value.length} (${response.selected_products.map((p: any) => p.name).join(', ') || 'IA Sugerido'})`,
        currentIssues: response.current_issues,
        prompt: response.prompt
      });
      
      activeDesignId.value = newId;
      selectedProductIds.value = []; // Limpiar selección para el próximo turno

      // Animación de celebración
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#3b82f6']
      });
    } else {
      const errText = await res.text();
      alert(`Hubo un problema al generar la propuesta: ${errText}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con el backend.");
  } finally {
    clearInterval(stepInterval);
    isGenerating.value = false;
  }
};

const downloadDesign = () => {
  if (!activeDesign.value) return;
  const proxyUrl = `${API_URL}/api/proxy?url=${encodeURIComponent(activeDesign.value.imageUrl)}`;
  downloadImage(proxyUrl, `rediseno-more-house-etapa-${designHistory.value.indexOf(activeDesign.value)}.png`);
};

// Manejo de carga de archivos
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files && files[0]) {
    processFile(files[0]);
  }
};

const handleDrop = (e: DragEvent) => {
  uploadDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files && files[0]) {
    processFile(files[0]);
  }
};

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('Por favor carga únicamente archivos de imagen.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert('La imagen supera el límite de 10MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Img = e.target?.result as string;
    uploadedImage.value = base64Img;
    designHistory.value = [
      { id: 'original', imageUrl: base64Img, products: [], label: 'Habitación Original' }
    ];
    activeDesignId.value = 'original';
    selectedProductIds.value = [];
  };
  reader.readAsDataURL(file);
};

const clearUploadedImage = () => {
  uploadedImage.value = null;
  designHistory.value = [];
  activeDesignId.value = '';
  selectedProductIds.value = [];
};

// Descargar imagen
const downloadImage = (imgUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = imgUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ==========================================
// ESTADO: CATALOGO
// ==========================================
const selectedCategory = ref<string>('Todos');
const selectedStyle = ref<string>('Todos');

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const catMatch = selectedCategory.value === 'Todos' || p.category === selectedCategory.value;
    const styleMatch = selectedStyle.value === 'Todos' || p.style === selectedStyle.value;
    return catMatch && styleMatch;
  });
});

// ==========================================
// ESTADO: ADMIN
// ==========================================
const isAdminLoggedIn = ref(false);
const adminCredentials = ref({ username: '', password: '' });
const loginError = ref('');

// CRUD Forms
const showAddModal = ref(false);
const editingProduct = ref<any | null>(null);
const productForm = ref({
  name: '',
  category: 'Sala',
  style: 'Minimalista',
  price: 0,
  dimensions: '',
  description: '',
  image: ''
});

const handleAdminLogin = async () => {
  loginError.value = '';
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminCredentials.value)
    });
    const data = await res.json();
    if (data.success) {
      isAdminLoggedIn.value = true;
    } else {
      loginError.value = data.message || 'Credenciales incorrectas.';
    }
  } catch (err) {
    loginError.value = 'Error al conectar con la API de autenticación.';
  }
};

const handleAdminLogout = () => {
  isAdminLoggedIn.value = false;
  adminCredentials.value = { username: '', password: '' };
};

const saveProduct = async () => {
  try {
    const url = editingProduct.value 
      ? `${API_URL}/api/catalog/${editingProduct.value.id}` 
      : `${API_URL}/api/catalog`;
    const method = editingProduct.value ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productForm.value)
    });

    if (res.ok) {
      await fetchCatalog();
      showAddModal.value = false;
      editingProduct.value = null;
      resetProductForm();
    }
  } catch (err) {
    console.error(err);
  }
};

const editProduct = (product: any) => {
  editingProduct.value = product;
  productForm.value = { ...product };
  showAddModal.value = true;
};

const deleteProduct = async (id: string) => {
  if (!confirm("¿Estás seguro de eliminar este producto del catálogo?")) return;
  try {
    const res = await fetch(`${API_URL}/api/catalog/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      await fetchCatalog();
    }
  } catch (err) {
    console.error(err);
  }
};

const resetProductForm = () => {
  productForm.value = {
    name: '',
    category: 'Sala',
    style: 'Minimalista',
    price: 0,
    dimensions: '',
    description: '',
    image: ''
  };
};

const openAddModal = () => {
  editingProduct.value = null;
  resetProductForm();
  showAddModal.value = true;
};

// Estado para estadísticas reales obtenidas del servidor
const realStats = ref({
  totalGenerations: 0,
  totalQuotes: 0,
  styleStats: {} as Record<string, number>,
  totalProducts: 0
});

const fetchStats = async () => {
  try {
    const res = await fetch(`${API_URL}/api/stats`);
    if (res.ok) {
      realStats.value = await res.json();
    }
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
};

const quoteProduct = async (product: any) => {
  try {
    const res = await fetch(`${API_URL}/api/stats/quote`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      realStats.value.totalQuotes = data.totalQuotes;
      alert(`✨ ¡Cotización Solicitada! Hemos enviado tu solicitud para: "${product.name}". (Métrica real registrada en el servidor)`);
    }
  } catch (err) {
    console.error(err);
  }
};

const quoteAllProducts = async () => {
  if (!activeDesign.value || activeDesign.value.products.length === 0) return;
  try {
    const res = await fetch(`${API_URL}/api/stats/quote`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      realStats.value.totalQuotes = data.totalQuotes;
      alert(`✨ ¡Cotización Completa Solicitada! Hemos registrado tu interés por los ${activeDesign.value.products.length} productos colocados en tu diseño por un valor total de $${activeDesign.value.products.reduce((acc: number, p: any) => acc + (p.details?.price || 0), 0)} USD.`);
    }
  } catch (err) {
    console.error(err);
  }
};

// Cargar estadísticas reales al iniciar
onMounted(() => {
  fetchStats();
});

// Estadísticas dinámicas vinculadas a la API
const stats = computed(() => {
  return [
    { name: "Procesamientos Reales IA", value: realStats.value.totalGenerations.toString(), icon: Sparkles, color: "text-indigo-400" },
    { name: "Cotizaciones / Leads", value: realStats.value.totalQuotes.toString(), icon: TrendingUp, color: "text-emerald-400" },
    { name: "Productos en Catálogo", value: products.value.length.toString(), icon: Package, color: "text-amber-400" }
  ];
});

// ==========================================
// ESTADO: GALERÍA DE ITERACIONES LIGHTBOX
// ==========================================
const isGalleryOpen = ref(false);
const galleryActiveDesignId = ref<string>('');

const galleryActiveIndex = computed(() => {
  return designHistory.value.findIndex(d => d.id === galleryActiveDesignId.value);
});

const galleryActiveDesign = computed(() => {
  return designHistory.value[galleryActiveIndex.value] || null;
});

const openGallery = (designId: string) => {
  galleryActiveDesignId.value = designId || activeDesignId.value || 'original';
  isGalleryOpen.value = true;
};

const closeGallery = () => {
  isGalleryOpen.value = false;
};

const selectGalleryDesign = (id: string) => {
  galleryActiveDesignId.value = id;
  activeDesignId.value = id; // Sincroniza el visor principal en tiempo real!
};

const galleryPrev = () => {
  const prevIdx = galleryActiveIndex.value - 1;
  if (prevIdx >= 0) {
    const id = designHistory.value[prevIdx].id;
    galleryActiveDesignId.value = id;
    activeDesignId.value = id;
  }
};

const galleryNext = () => {
  const nextIdx = galleryActiveIndex.value + 1;
  if (nextIdx < designHistory.value.length) {
    const id = designHistory.value[nextIdx].id;
    galleryActiveDesignId.value = id;
    activeDesignId.value = id;
  }
};

const downloadGalleryDesign = () => {
  const design = galleryActiveDesign.value;
  if (!design) return;
  const proxyUrl = `${API_URL}/api/proxy?url=${encodeURIComponent(design.imageUrl)}`;
  downloadImage(proxyUrl, `rediseno-more-house-etapa-${designHistory.value.indexOf(design)}.png`);
};

</script>

<template>
  <div class="min-h-screen flex flex-col relative bg-[#090d16]">
    <!-- Fondo decorativo abstracto -->
    <div class="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[140px] pointer-events-none"></div>

    <!-- NAVBAR PREMIUM GLASSMORPHISM -->
    <nav class="glass-nav sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="bg-indigo-500/20 border border-indigo-500/30 p-2 rounded-xl text-indigo-400 flex items-center justify-center">
          <Sparkles class="w-6 h-6 animate-pulse-subtle" />
        </div>
        <div>
          <span class="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-300 bg-clip-text text-transparent">More House</span>
          <span class="text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full ml-2">Decor IA</span>
        </div>
      </div>

      <!-- TABS DE NAVEGACIÓN -->
      <div class="flex gap-1 bg-slate-900/60 border border-white/5 p-1 rounded-xl">
        <button 
          @click="activeTab = 'designer'"
          :class="activeTab === 'designer' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
        >
          <Layout class="w-4 h-4" />
          Diseñador IA
        </button>
        <button 
          @click="activeTab = 'catalog'"
          :class="activeTab === 'catalog' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
        >
          <Grid class="w-4 h-4" />
          Catálogo
        </button>
        <button 
          @click="activeTab = 'admin'; fetchStats();"
          :class="activeTab === 'admin' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
        >
          <Settings class="w-4 h-4" />
          Administrador
        </button>
      </div>
    </nav>

    <!-- CONTENEDOR PRINCIPAL CON TRANSICIONES -->
    <main class="flex-grow max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col justify-start">
      
      <!-- 1. TAB: DISEÑADOR IA -->
      <section v-if="activeTab === 'designer'" class="flex-grow flex flex-col gap-8 animate-slide-up">
        
        <!-- ENCABEZADO -->
        <div class="text-center max-w-2xl mx-auto mb-4">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Rediseña tus Espacios con IA
          </h1>
          <p class="text-slate-400 text-sm md:text-base">
            Sube una fotografía de tu habitación, especifica tus preferencias estéticas y decora con fotorrealismo por turnos agregando productos de catálogo.
          </p>
        </div>

        <!-- ZONA DE SUBIDA (Si no hay imagen) -->
        <div v-if="!uploadedImage" class="max-w-2xl w-full mx-auto">
          <div 
            @dragover.prevent="uploadDragOver = true"
            @dragleave.prevent="uploadDragOver = false"
            @drop.prevent="handleDrop"
            :class="[
              uploadDragOver ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'
            ]"
            class="glass-card p-12 py-24 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 text-center"
            @click="triggerFileInput"
          >
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden" 
              accept="image/*" 
              @change="handleFileChange"
            />
            <div class="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner mb-4">
              <Upload class="w-8 h-8 animate-pulse-subtle" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-100">Arrastra tu fotografía aquí</h3>
              <p class="text-slate-400 text-sm mt-1">O haz clic para explorar en tu dispositivo</p>
              <p class="text-slate-500 text-xs mt-3">Formatos soportados: JPG, PNG, WEBP, AVIF (Máx 10MB)</p>
            </div>
          </div>
        </div>

        <!-- WORKSPACE DEL DISEÑADOR (Si ya hay imagen cargada) -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- COLUMNA 1: CONTROLES DE ESPECIFICACIONES (LADO IZQUIERDO, 4/12) -->
          <div class="lg:col-span-4 flex flex-col gap-6">
            <div class="glass-card p-6 rounded-3xl flex flex-col gap-5">
              <h2 class="text-lg font-bold tracking-tight border-b border-white/5 pb-3 text-slate-100 flex items-center gap-2">
                <Settings class="w-5 h-5 text-indigo-400" />
                Especificaciones
              </h2>

              <!-- Tipo de espacio -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400">Tipo de espacio</label>
                <select v-model="preferences.spaceType" class="glass-input py-2 text-sm w-full">
                  <option>Sala</option>
                  <option>Comedor</option>
                  <option>Oficina / Estudio</option>
                  <option>Cocina</option>
                  <option>Dormitorio</option>
                </select>
              </div>

              <!-- Estilo estético -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400">Estilo estético</label>
                <select v-model="preferences.style" class="glass-input py-2 text-sm w-full">
                  <option>Minimalista</option>
                  <option>Moderno</option>
                  <option>Elegante</option>
                  <option>Lujo</option>
                  <option>Industrial</option>
                </select>
              </div>

              <!-- Colores -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400">Paleta de colores</label>
                <input v-model="preferences.colors" type="text" class="glass-input py-2.5 text-sm w-full" placeholder="Gris suave, madera y beige" />
              </div>

              <!-- Iluminación -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400">Iluminación</label>
                <input v-model="preferences.lighting" type="text" class="glass-input py-2.5 text-sm w-full" placeholder="Luz natural y lámparas cálidas" />
              </div>

              <!-- Instrucciones adicionales (Texto Libre) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400">¿Qué deseas agregar? (Texto libre)</label>
                <textarea 
                  v-model="preferences.customText" 
                  class="glass-input py-2 h-16 text-xs w-full resize-none" 
                  placeholder="Ej: pon cortinas blancas de tela, papel tapiz de textura de madera de roble, presupuesto de $2000"
                ></textarea>
              </div>

              <!-- Checklist de Catálogo a colocar -->
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-slate-400">Muebles de Catálogo a colocar</label>
                  <span class="text-[10px] text-indigo-300 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    Turno: {{ selectedProductIds.length }}/3
                  </span>
                </div>
                <div class="p-2.5 rounded-2xl bg-slate-950/60 border border-white/5 max-h-48 overflow-y-auto flex flex-col gap-2 scrollbar-thin">
                  <div 
                    v-for="prod in products" 
                    :key="prod.id"
                    @click="!isProductAlreadyPlaced(prod.id) && toggleProductSelection(prod.id)"
                    :class="[
                      isProductAlreadyPlaced(prod.id) ? 'opacity-50 cursor-default' : 'hover:bg-white/10 cursor-pointer',
                      selectedProductIds.includes(prod.id) ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/5'
                    ]"
                    class="flex items-center justify-between p-2.5 rounded-xl border transition-colors select-none"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <img :src="prod.image" class="w-9 h-9 object-cover rounded-lg border border-white/10" />
                      <div class="min-w-0">
                        <p class="text-xs font-bold text-slate-200 truncate">{{ prod.name }}</p>
                        <p class="text-[10px] text-slate-400">${{ prod.price }} | {{ prod.style }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span v-if="isProductAlreadyPlaced(prod.id)" class="text-[9px] font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.5 rounded-md">
                        Colocado
                      </span>
                      <input 
                        v-else
                        type="checkbox" 
                        :value="prod.id" 
                        :checked="selectedProductIds.includes(prod.id)"
                        :disabled="!selectedProductIds.includes(prod.id) && selectedProductIds.length >= 3"
                        @change="toggleProductSelection(prod.id)"
                        @click.stop
                        class="rounded accent-indigo-500 bg-slate-950 border-white/10 cursor-pointer w-4 h-4 disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div v-if="products.length === 0" class="text-center py-6 text-xs text-slate-500 flex flex-col items-center gap-2">
                    <span>No se cargó el catálogo.</span>
                    <button 
                      @click="fetchCatalog" 
                      class="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-500/40 transition-colors"
                    >
                      <RefreshCw class="w-3 h-3" /> Reintentar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Prioridad Calidad / Velocidad -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400">Prioridad del Renderizado</label>
                <div class="grid grid-cols-2 gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/5">
                  <button 
                    type="button"
                    @click="preferences.priority = 'speed'"
                    :class="preferences.priority === 'speed' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow' : 'text-slate-400 border-transparent hover:text-slate-200'"
                    class="py-2 px-2.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all duration-200"
                  >
                    <span>⚡ Rapidez (Klein)</span>
                  </button>
                  <button 
                    type="button"
                    @click="preferences.priority = 'quality'"
                    :class="preferences.priority === 'quality' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow' : 'text-slate-400 border-transparent hover:text-slate-200'"
                    class="py-2 px-2.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all duration-200"
                  >
                    <span>🎨 Calidad (Dev)</span>
                  </button>
                </div>
              </div>

              <!-- BOTÓN DE GENERACIÓN -->
              <button 
                @click="generateDesign"
                :disabled="isGenerating"
                class="glass-btn-primary w-full flex items-center justify-center gap-2 mt-2 py-2.5 text-sm"
              >
                <Sparkles class="w-4 h-4" />
                <span>{{ isGenerating ? 'Procesando Turno...' : 'Generar Turno de Diseño' }}</span>
              </button>
            </div>
          </div>

          <!-- COLUMNA 2: VISOR PRINCIPAL Y HISTORIAL TIMELINE (CENTRO, 5/12) -->
          <div class="lg:col-span-5 flex flex-col gap-6">
            <div class="glass-card p-4 rounded-3xl flex flex-col gap-4">
              <div class="flex items-center justify-between border-b border-white/5 pb-3">
                <span class="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles class="w-3.5 h-3.5 animate-pulse-subtle" />
                  Visor de Diseño
                </span>
                <span class="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  {{ activeDesign?.label }}
                </span>
              </div>

              <!-- Contenedor del Visor -->
              <div class="relative w-full aspect-[4/3] rounded-2xl border border-white/5 bg-slate-950 overflow-hidden flex items-center justify-center">
                <!-- Render clickeable -->
                <div 
                  v-if="activeDesign?.imageUrl"
                  @click="openGallery(activeDesignId)"
                  class="w-full h-full relative cursor-zoom-in group/visor select-none"
                >
                  <img 
                    :src="activeDesign.imageUrl" 
                    alt="Visor de Staging" 
                    class="w-full h-full object-cover transition-transform duration-500 group-hover/visor:scale-[1.01]"
                  />
                  <!-- Hover overlay con icono de ampliar y galería -->
                  <div class="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/visor:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div class="bg-slate-950/85 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl text-indigo-300 shadow-xl flex items-center gap-2 transform scale-90 group-hover/visor:scale-100 transition-all duration-300">
                      <Maximize2 class="w-4 h-4" />
                      <span class="text-xs font-bold">Ver Galería / Ampliar</span>
                    </div>
                  </div>
                </div>

                <!-- Imagen Original clickeable -->
                <div 
                  v-else-if="uploadedImage"
                  @click="openGallery('original')"
                  class="w-full h-full relative cursor-zoom-in group/visor select-none"
                >
                  <img 
                    :src="uploadedImage" 
                    alt="Habitación Original" 
                    class="w-full h-full object-cover transition-transform duration-500 group-hover/visor:scale-[1.01]"
                  />
                  <div class="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/visor:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div class="bg-slate-950/85 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl text-indigo-300 shadow-xl flex items-center gap-2 transform scale-90 group-hover/visor:scale-100 transition-all duration-300">
                      <Maximize2 class="w-4 h-4" />
                      <span class="text-xs font-bold">Ver Galería / Ampliar</span>
                    </div>
                  </div>
                </div>

                <!-- Botón de Acceso Rápido a la Galería en la esquina superior izquierda si hay historial -->
                <button 
                  v-if="designHistory.length > 0 && !isGenerating"
                  @click.stop="openGallery(activeDesignId)"
                  class="absolute top-3 left-3 bg-slate-950/70 hover:bg-slate-950 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl text-indigo-400 hover:text-indigo-300 transition-all duration-200 hover:scale-105 z-30 flex items-center gap-1.5 font-semibold text-xs shadow-md"
                  title="Abrir Galería de Propuestas"
                >
                  <Eye class="w-4 h-4" />
                  <span>Galería ({{ designHistory.length }})</span>
                </button>

                <!-- Loading overlay -->
                <div v-if="isGenerating" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-40">
                  <div class="relative w-16 h-16 flex items-center justify-center">
                    <div class="absolute inset-0 rounded-full border-4 border-slate-900 border-t-indigo-500 animate-spin"></div>
                    <Sparkles class="w-6 h-6 text-indigo-400 animate-pulse-subtle" />
                  </div>
                  <div class="text-center px-4">
                    <p class="text-sm font-bold text-slate-100">Renderizando con IA...</p>
                    <p class="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto italic h-8">
                      {{ generationLogs[generationStep] }}
                    </p>
                  </div>
                </div>

                <!-- Botones Flotantes -->
                <div v-if="!isGenerating && activeDesignId !== 'original'" class="absolute bottom-3 right-3 flex gap-2 z-30">
                  <button 
                    @click.stop="downloadDesign"
                    class="bg-indigo-500 hover:bg-brand-600 px-4 py-2.5 rounded-xl text-white shadow-lg flex items-center gap-1.5 font-bold text-xs border border-white/10 transition-transform duration-200 hover:scale-105"
                  >
                    <Download class="w-3.5 h-3.5" />
                    Descargar Render
                  </button>
                  <button 
                    @click.stop="clearUploadedImage"
                    class="bg-red-500/20 hover:bg-red-500 border border-red-500/30 p-2.5 rounded-xl text-red-200 hover:text-white transition-transform duration-200 hover:scale-105 shadow-lg"
                    title="Empezar diseño desde cero"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- TIMELINE DE HISTORIAL (MINIATURAS HORIZONTALES) -->
              <div class="flex flex-col gap-2 mt-1">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Línea de Tiempo del Diseño (Historial)</span>
                <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  <div 
                    v-for="(design, index) in designHistory" 
                    :key="design.id"
                    @click="activeDesignId = design.id"
                    :class="[
                      activeDesignId === design.id ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.02]' : 'border-white/10 opacity-70 hover:opacity-100 hover:scale-[1.01]'
                    ]"
                    class="flex-shrink-0 w-24 border rounded-xl overflow-hidden cursor-pointer bg-slate-950 transition-all duration-200"
                  >
                    <div class="h-16 w-full relative">
                      <img :src="design.imageUrl" class="w-full h-full object-cover" />
                      <span class="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[8px] font-bold text-slate-300">
                        {{ index === 0 ? 'Vacío' : `Etapa ${index}` }}
                      </span>
                    </div>
                    <div class="p-1 text-center border-t border-white/5 bg-slate-950">
                      <p class="text-[9px] font-bold text-slate-300 truncate px-0.5">{{ design.label }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMNA 3: EVALUACIÓN Y COTIZACIÓN ACUMULADA (LADO DERECHO, 3/12) -->
          <div class="lg:col-span-3 flex flex-col gap-6">
            <!-- Evaluación del Espacio -->
            <div class="glass-card p-6 rounded-3xl flex flex-col gap-3">
              <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
                <Info class="w-4 h-4 text-indigo-400" />
                Evaluación del Espacio
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto scrollbar-thin">
                {{ activeDesign?.currentIssues || 'Sube una habitación y genera tu primer diseño para ver la evaluación automática de la IA.' }}
              </p>
              
              <div v-if="activeDesign?.prompt" class="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl flex flex-col gap-1 mt-1">
                <span class="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Prompt de Imagen Generado</span>
                <p class="text-[10px] text-slate-400 italic line-clamp-3 hover:line-clamp-none transition-all duration-300 cursor-pointer">
                  "{{ activeDesign.prompt }}"
                </p>
              </div>
            </div>

            <!-- Carrito de Cotización Acumulado -->
            <div class="glass-card p-6 rounded-3xl flex flex-col gap-4 flex-grow justify-between">
              <div class="flex flex-col gap-3">
                <h3 class="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
                  <Package class="w-4 h-4 text-indigo-400" />
                  Mobiliario en este Diseño
                </h3>
                
                <div class="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-thin">
                  <div 
                    v-for="item in activeDesign?.products || []" 
                    :key="item.id"
                    class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <img :src="item.details?.image" class="w-7 h-7 object-cover rounded border border-white/10" />
                      <div class="min-w-0">
                        <p class="text-[10px] font-bold text-slate-200 truncate">{{ item.name }}</p>
                        <p class="text-[8px] text-slate-500 truncate italic">"{{ item.justification.substring(0, 45) }}..."</p>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0 flex flex-col items-end gap-0.5">
                      <span class="text-[10px] font-bold text-slate-300">${{ item.details?.price || 0 }}</span>
                      <button @click="quoteProduct(item.details)" class="text-[8px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                        Cotizar
                      </button>
                    </div>
                  </div>
                  <div v-if="!activeDesign || activeDesign.products.length === 0" class="text-center py-8 text-xs text-slate-500 italic">
                    Sin muebles agregados todavía.
                  </div>
                </div>
              </div>

              <!-- Costo Acumulado y Cotización Total -->
              <div v-if="activeDesign && activeDesign.products.length > 0" class="border-t border-white/5 pt-3 mt-3 flex flex-col gap-3">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-slate-400">Total Cotización:</span>
                  <span class="text-base font-extrabold text-indigo-300">
                    ${{ activeDesign.products.reduce((acc: number, p: any) => acc + (p.details?.price || 0), 0) }}
                  </span>
                </div>
                <button 
                  @click="quoteAllProducts" 
                  class="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow"
                >
                  <DollarSign class="w-3.5 h-3.5" />
                  Solicitar Cotización Completa
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </section>
      
      <!-- 2. TAB: CATALOGO -->
      <section v-if="activeTab === 'catalog'" class="flex-grow flex flex-col gap-8 animate-slide-up">
        
        <!-- ENCABEZADO Y FILTROS -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div>
            <h2 class="text-3xl font-extrabold text-slate-100 tracking-tight">Catálogo More House</h2>
            <p class="text-slate-400 text-sm mt-1">Explora nuestras colecciones exclusivas de muebles y decoración.</p>
          </div>

          <div class="flex flex-wrap gap-4 w-full md:w-auto">
            <!-- Categoría -->
            <div class="flex flex-col gap-1.5 flex-grow md:flex-grow-0">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
              <select v-model="selectedCategory" class="glass-input py-2">
                <option>Todos</option>
                <option>Sala</option>
                <option>Comedor</option>
                <option>Oficina</option>
              </select>
            </div>
            <!-- Estilo -->
            <div class="flex flex-col gap-1.5 flex-grow md:flex-grow-0">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estilo</label>
              <select v-model="selectedStyle" class="glass-input py-2">
                <option>Todos</option>
                <option>Minimalista</option>
                <option>Moderno</option>
                <option>Elegante</option>
                <option>Industrial</option>
                <option>Lujo</option>
              </select>
            </div>
          </div>
        </div>

        <!-- MOCK DE CARGA -->
        <div v-if="catalogLoading" class="text-center py-20 flex flex-col items-center gap-3">
          <RefreshCw class="w-8 h-8 text-indigo-500 animate-spin" />
          <span class="text-slate-400 text-sm">Cargando catálogo oficial...</span>
        </div>
        <div v-else-if="products.length === 0" class="text-center py-20 flex flex-col items-center gap-3">
          <span class="text-slate-400 text-sm">No se pudo conectar al servidor para obtener el catálogo.</span>
          <button 
            @click="fetchCatalog" 
            class="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow shadow-indigo-500/20"
          >
            <RefreshCw class="w-4 h-4" /> Intentar Cargar Catálogo
          </button>
        </div>

        <!-- GRILLA DE PRODUCTOS -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="prod in filteredProducts" 
            :key="prod.id" 
            class="glass-card glass-card-hover overflow-hidden rounded-3xl flex flex-col justify-between group"
          >
            <div class="relative overflow-hidden h-[180px]">
              <img 
                :src="prod.image" 
                :alt="prod.name" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span class="absolute top-4 right-4 bg-[#090d16]/80 backdrop-blur-md border border-white/10 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full">
                {{ prod.category }}
              </span>
            </div>

            <div class="p-5 flex flex-col gap-3 flex-grow justify-between">
              <div class="flex flex-col gap-1.5">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-bold text-slate-100 text-base group-hover:text-indigo-400 transition-colors leading-tight">{{ prod.name }}</h3>
                  <span class="font-bold text-slate-100 text-base">${{ prod.price }}</span>
                </div>
                <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">{{ prod.description }}</p>
              </div>

              <div class="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2 text-[10px] text-slate-500">
                <span>📏 Dimensiones: {{ prod.dimensions }}</span>
                <span>🏷️ Estilo: {{ prod.style }}</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      <!-- 3. TAB: ADMIN -->
      <section v-if="activeTab === 'admin'" class="flex-grow flex flex-col gap-8 animate-slide-up">
        
        <!-- ESTADO: NO LOGUEADO -->
        <div v-if="!isAdminLoggedIn" class="max-w-md w-full mx-auto my-12 glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-6">
          <div class="text-center flex flex-col items-center gap-2">
            <div class="w-12 h-12 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shadow-inner">
              <Settings class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-bold text-slate-100 tracking-tight">Acceso Administrativo</h2>
            <p class="text-slate-400 text-xs">Ingresa tus credenciales seguras para administrar el sistema.</p>
          </div>

          <form @submit.prevent="handleAdminLogin" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400">Usuario</label>
              <input v-model="adminCredentials.username" type="text" class="glass-input" required placeholder="Usuario" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400">Contraseña</label>
              <input v-model="adminCredentials.password" type="password" class="glass-input" required placeholder="Contraseña" />
            </div>

            <div v-if="loginError" class="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert class="w-4 h-4 text-red-400" />
              <span>{{ loginError }}</span>
            </div>

            <button type="submit" class="glass-btn-primary w-full mt-2">Iniciar Sesión</button>
          </form>
        </div>

        <!-- ESTADO: LOGUEADO -->
        <div v-else class="flex flex-col gap-8">
          
          <!-- CABECERA ADMIN -->
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <h2 class="text-3xl font-extrabold text-slate-100 tracking-tight">Panel Administrativo</h2>
              <p class="text-slate-400 text-sm mt-1">Administra el inventario oficial e inspecciona las métricas de uso.</p>
            </div>
            
            <button @click="handleAdminLogout" class="bg-red-500/10 border border-red-500/25 hover:bg-red-500 text-red-200 hover:text-white font-medium text-sm px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2">
              <LogOut class="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>

          <!-- TARJETAS DE MÉTRICAS -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="stat in stats" 
              :key="stat.name" 
              class="glass-card p-6 rounded-3xl flex items-center justify-between"
            >
              <div class="flex flex-col gap-1">
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ stat.name }}</span>
                <span class="text-3xl font-extrabold text-slate-100">{{ stat.value }}</span>
              </div>
              <div :class="stat.color" class="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <component :is="stat.icon" class="w-6 h-6" />
              </div>
            </div>
          </div>

          <!-- GRÁFICA DE ESTILOS MÁS SOLICITADOS -->
          <div class="glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-4">
            <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
              <TrendingUp class="w-5 h-5 text-indigo-400" />
              Estilos más Solicitados (Preferencia de Clientes)
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
              <div 
                v-for="(count, style) in realStats.styleStats" 
                :key="style" 
                class="bg-brand-card/30 border border-white/5 p-4 rounded-2xl flex flex-col gap-2"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-200">{{ style }}</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-brand-500/10">
                    {{ count }}
                  </span>
                </div>
                <div class="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-white/5">
                  <div 
                    class="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                    :style="{ width: `${realStats.totalGenerations > 0 ? (count / realStats.totalGenerations) * 100 : 0}%` }"
                  ></div>
                </div>
                <span class="text-[10px] text-slate-500">
                  {{ realStats.totalGenerations > 0 ? Math.round((count / realStats.totalGenerations) * 100) : 0 }}% de peticiones
                </span>
              </div>
            </div>
          </div>

          <!-- CRUD DEL INVENTARIO -->
          <div class="glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-6">
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-lg font-bold text-slate-100">Catálogo Oficial de Muebles</h3>
              <button @click="openAddModal" class="glass-btn-primary flex items-center gap-1.5 py-2.5 text-sm">
                <Plus class="w-4 h-4" />
                Agregar Producto
              </button>
            </div>

            <!-- TABLA CRUD -->
            <div class="overflow-x-auto border border-white/5 rounded-2xl">
              <table class="w-full border-collapse text-left text-sm text-slate-300">
                <thead class="bg-slate-900/60 border-b border-white/5 font-semibold text-slate-400">
                  <tr>
                    <th class="p-4">Imagen</th>
                    <th class="p-4">Nombre</th>
                    <th class="p-4">Categoría</th>
                    <th class="p-4">Estilo</th>
                    <th class="p-4 text-right">Precio</th>
                    <th class="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr v-for="prod in products" :key="prod.id" class="hover:bg-white/5 transition-colors">
                    <td class="p-4">
                      <img :src="prod.image" :alt="prod.name" class="w-10 h-10 object-cover rounded-lg border border-white/10" />
                    </td>
                    <td class="p-4 font-bold text-slate-100">{{ prod.name }}</td>
                    <td class="p-4">{{ prod.category }}</td>
                    <td class="p-4">
                      <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {{ prod.style }}
                      </span>
                    </td>
                    <td class="p-4 text-right font-bold text-slate-100">${{ prod.price }}</td>
                    <td class="p-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <button @click="editProduct(prod)" class="p-2 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg transition-all" title="Editar">
                          <Edit3 class="w-4 h-4" />
                        </button>
                        <button @click="deleteProduct(prod.id)" class="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all" title="Eliminar">
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="products.length === 0">
                    <td colspan="6" class="p-8 text-center text-slate-500">No hay productos cargados en el catálogo.</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </section>

    </main>

    <!-- FOOTER PREMIUM -->
    <footer class="mt-auto border-t border-white/5 bg-[#0b0f19] px-6 py-6 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <span>&copy; 2026 More House S.A. Todos los derechos reservados.</span>
      </div>
      <div class="flex items-center gap-2 text-slate-600">
        <span>Código de Proyecto: MHD-IA-2026-01</span>
        <span>|</span>
        <span>Powered by Bun, Elysia, Vue & Tailwind</span>
      </div>
    </footer>

    <!-- MODAL AGREGAR / EDITAR PRODUCTO -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div class="glass-card max-w-lg w-full p-6 md:p-8 rounded-3xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        <h3 class="text-xl font-bold text-slate-100 border-b border-white/5 pb-4">
          {{ editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto' }}
        </h3>

        <form @submit.prevent="saveProduct" class="flex flex-col gap-4">
          <!-- Nombre -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400">Nombre del Producto</label>
            <input v-model="productForm.name" type="text" class="glass-input" required placeholder="Ej. Poltrona Mónaco" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Categoría -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400">Categoría</label>
              <select v-model="productForm.category" class="glass-input">
                <option>Sala</option>
                <option>Comedor</option>
                <option>Oficina</option>
              </select>
            </div>
            <!-- Estilo -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400">Estilo</label>
              <select v-model="productForm.style" class="glass-input">
                <option>Minimalista</option>
                <option>Moderno</option>
                <option>Elegante</option>
                <option>Lujo</option>
                <option>Industrial</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Precio -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400">Precio ($ USD)</label>
              <input v-model="productForm.price" type="number" class="glass-input" required min="0" placeholder="0" />
            </div>
            <!-- Dimensiones -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400">Medidas / Dimensiones</label>
              <input v-model="productForm.dimensions" type="text" class="glass-input" required placeholder="Ej. 180x80x75 cm" />
            </div>
          </div>

          <!-- URL Imagen -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400">URL de la Imagen</label>
            <input v-model="productForm.image" type="url" class="glass-input" placeholder="https://unsplash.com/..." />
          </div>

          <!-- Descripción -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400">Descripción</label>
            <textarea v-model="productForm.description" class="glass-input h-20" placeholder="Breve descripción del producto..."></textarea>
          </div>

          <!-- Botones de Acción -->
          <div class="flex justify-end gap-3 mt-2 pt-4 border-t border-white/5">
            <button type="button" @click="showAddModal = false" class="glass-btn-secondary py-2.5 text-sm">Cancelar</button>
            <button type="submit" class="glass-btn-primary py-2.5 text-sm">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL GALERÍA DE ITERACIONES LIGHTBOX (FULL-SCREEN PREMIUM) -->
    <div 
      v-if="isGalleryOpen" 
      class="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/95 backdrop-blur-md p-6 animate-fade-in"
      @click.self="closeGallery"
    >
      <!-- Cabecera de la Galería -->
      <div class="flex items-center justify-between border-b border-white/5 pb-4">
        <div class="flex items-center gap-3">
          <div class="bg-indigo-500/20 border border-indigo-500/30 p-2 rounded-xl text-indigo-400">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
              Galería de Iteraciones
              <span class="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Etapa {{ galleryActiveIndex }} de {{ designHistory.length - 1 }}
              </span>
            </h3>
            <p class="text-slate-400 text-xs mt-0.5">{{ galleryActiveDesign?.label }}</p>
          </div>
        </div>

        <button 
          @click="closeGallery" 
          class="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Área de Contenido Principal (Grilla Central: Navegación + Detalle) -->
      <div class="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 min-h-0">
        
        <!-- COLUMNA RENDER CENTRAL (8/12 en LG) -->
        <div class="lg:col-span-8 flex items-center justify-between gap-4 h-full min-h-0">
          
          <!-- Botón Anterior -->
          <button 
            @click="galleryPrev" 
            :disabled="galleryActiveIndex <= 0"
            class="p-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed border border-white/10 transition-all shadow-lg flex-shrink-0"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>

          <!-- Imagen Grande del Visor -->
          <div class="flex-grow h-full max-h-[65vh] rounded-3xl border border-white/10 bg-slate-900 overflow-hidden flex items-center justify-center relative shadow-2xl group">
            <img 
              v-if="galleryActiveDesign?.imageUrl"
              :src="galleryActiveDesign.imageUrl" 
              class="w-full h-full object-contain"
            />
            
            <!-- Botón de Descarga Rápido Flotante -->
            <button 
              v-if="galleryActiveDesignId !== 'original'"
              @click.stop="downloadGalleryDesign"
              class="absolute bottom-4 right-4 bg-indigo-500 hover:bg-indigo-600 px-4 py-2.5 rounded-xl text-white shadow-lg flex items-center gap-1.5 font-bold text-xs border border-white/10 transition-all hover:scale-105"
            >
              <Download class="w-3.5 h-3.5" />
              Descargar este Render
            </button>
          </div>

          <!-- Botón Siguiente -->
          <button 
            @click="galleryNext" 
            :disabled="galleryActiveIndex >= designHistory.length - 1"
            class="p-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed border border-white/10 transition-all shadow-lg flex-shrink-0"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
        </div>

        <!-- COLUMNA DETALLES Y PRESUPUESTO (4/12 en LG) -->
        <div class="lg:col-span-4 flex flex-col gap-5 h-full min-h-0 overflow-y-auto pr-2 scrollbar-thin">
          
          <!-- Información y Evaluación de la Habitación en esta etapa -->
          <div class="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Info class="w-4 h-4" />
              Detalles de la Iteración
            </h4>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span class="text-slate-400">Etapa:</span>
                <span class="text-slate-200 font-bold">{{ galleryActiveIndex === 0 ? 'Habitación Original' : `Propuesta ${galleryActiveIndex}` }}</span>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed italic">
                {{ galleryActiveDesign?.currentIssues || 'Fotografía base cargada por el usuario.' }}
              </p>
            </div>
            
            <!-- Prompt de IA Utilizado -->
            <div v-if="galleryActiveDesign?.prompt" class="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl flex flex-col gap-1 mt-1">
              <span class="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Prompt Generado para FLUX.2</span>
              <p class="text-[10px] text-slate-400 italic">
                "{{ galleryActiveDesign.prompt }}"
              </p>
            </div>
          </div>

          <!-- Mobiliario en esta etapa -->
          <div class="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-3 flex-grow min-h-0">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Package class="w-4 h-4" />
              Muebles Colocados hasta este turno
            </h4>
            
            <div class="flex flex-col gap-2 overflow-y-auto scrollbar-thin max-h-52">
              <div 
                v-for="item in galleryActiveDesign?.products || []" 
                :key="item.id"
                class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <img :src="item.details?.image" class="w-8 h-8 object-cover rounded border border-white/10" />
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold text-slate-200 truncate">{{ item.name }}</p>
                    <p class="text-[8px] text-slate-500 truncate italic">"{{ item.justification }}"</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <span class="text-[10px] font-bold text-slate-300">${{ item.details?.price || 0 }}</span>
                </div>
              </div>
              <div v-if="!galleryActiveDesign || galleryActiveDesign.products.length === 0" class="text-center py-8 text-xs text-slate-500 italic">
                Sin muebles agregados todavía.
              </div>
            </div>

            <!-- Costo acumulado en la etapa de la galería -->
            <div v-if="galleryActiveDesign && galleryActiveDesign.products.length > 0" class="border-t border-white/5 pt-3 mt-auto flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-400">Presupuesto Acumulado:</span>
              <span class="text-sm font-extrabold text-indigo-300">
                ${{ galleryActiveDesign.products.reduce((acc: number, p: any) => acc + (p.details?.price || 0), 0) }} USD
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- Barra Inferior de la Galería (Miniaturas Timeline para Navegación Directa) -->
      <div class="border-t border-white/5 pt-4">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">Hacer clic en cualquier miniatura para saltar a esa iteración</span>
        <div class="flex justify-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          <div 
            v-for="(design, index) in designHistory" 
            :key="design.id"
            @click="selectGalleryDesign(design.id)"
            :class="[
              galleryActiveDesignId === design.id ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.02]' : 'border-white/10 opacity-60 hover:opacity-100 hover:scale-[1.01]'
            ]"
            class="flex-shrink-0 w-24 border rounded-xl overflow-hidden cursor-pointer bg-slate-950 transition-all duration-200"
          >
            <div class="h-14 w-full relative">
              <img :src="design.imageUrl" class="w-full h-full object-cover" />
              <span class="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[8px] font-bold text-slate-300">
                {{ index === 0 ? 'Vacío' : `Etapa ${index}` }}
              </span>
            </div>
            <div class="p-1 text-center border-t border-white/5 bg-slate-950">
              <p class="text-[9px] font-bold text-slate-300 truncate px-0.5">{{ design.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
