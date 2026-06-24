<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Upload, Sparkles, Image as ImageIcon, ChevronRight, RefreshCw, 
  Trash2, Download, Package, Grid, Settings, TrendingUp, Plus, 
  Edit3, LogOut, CheckCircle, Info, DollarSign, Layout, ShieldAlert
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

const preferences = ref({
  spaceType: 'Sala',
  style: 'Minimalista',
  colors: 'Tonos neutros y cálidos (Beige, Gris suave, Madera)',
  lighting: 'Luz natural abundante con lámparas cálidas de acento',
  elements: 'Sofá modular, Mesa de centro, Plantas decorativas'
});

const isGenerating = ref(false);
const generationStep = ref(0);
const generationLogs = [
  "Analizando volumetría del espacio con Gemini 1.5 Flash...",
  "Evaluando iluminación actual y detectando inconsistencias...",
  "Consultando catálogo oficial de More House S.A...",
  "Generando propuesta de renderizado hiperrealista con Cloudflare Workers AI...",
  "Compilando y optimizando el dossier de diseño..."
];

// Resultados de la generación
const designResult = ref<{
  current_issues: string;
  prompt: string;
  generated_image: string;
  selected_products: any[];
} | null>(null);

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
    uploadedImage.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const clearUploadedImage = () => {
  uploadedImage.value = null;
  designResult.value = null;
};

// Orquestar generación con Backend
const generateDesign = async () => {
  if (!uploadedImage.value) return;

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
        image: uploadedImage.value,
        preferences: preferences.value
      })
    });

    if (res.ok) {
      designResult.value = await res.json();
      clearInterval(stepInterval);
      // Animación de celebración
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#3b82f6']
      });
    } else {
      alert("Hubo un problema al generar la propuesta con el servidor de Elysia.");
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con el backend.");
  } finally {
    clearInterval(stepInterval);
    isGenerating.value = false;
  }
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

// Estadísticas simuladas
const stats = computed(() => {
  return [
    { name: "Procesamientos Totales IA", value: "348", icon: Sparkles, color: "text-indigo-400" },
    { name: "Conversión de Venta", value: "+24.8%", icon: TrendingUp, color: "text-emerald-400" },
    { name: "Productos en Catálogo", value: products.value.length.toString(), icon: Package, color: "text-amber-400" }
  ];
});

</script>

<template>
  <div class="min-h-screen flex flex-col relative bg-[#090d16]">
    <!-- Fondo decorativo abstracto -->
    <div class="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[140px] pointer-events-none"></div>

    <!-- NAVBAR PREMIUM GLASSMORPHISM -->
    <nav class="glass-nav sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="bg-indigo-500/20 border border-brand-500/30 p-2 rounded-xl text-brand-500 flex items-center justify-center">
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
          :class="activeTab === 'designer' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
        >
          <Layout class="w-4 h-4" />
          Diseñador IA
        </button>
        <button 
          @click="activeTab = 'catalog'"
          :class="activeTab === 'catalog' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
        >
          <Grid class="w-4 h-4" />
          Catálogo
        </button>
        <button 
          @click="activeTab = 'admin'"
          :class="activeTab === 'admin' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
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
          <p class="text-slate-400 text-base md:text-lg">
            Sube una fotografía real de tu habitación, especifica tus preferencias estéticas y recibe una propuesta visual realista integrada con nuestro catálogo de lujo.
          </p>
        </div>

        <div v-if="!designResult" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- ZONA DE CARGA DE IMAGEN (LADO IZQUIERDO) -->
          <div class="lg:col-span-7 h-full flex flex-col">
            <div 
              @dragover.prevent="uploadDragOver = true"
              @dragleave.prevent="uploadDragOver = false"
              @drop.prevent="handleDrop"
              :class="[
                uploadDragOver ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/5' : 'border-white/10 hover:border-brand-500/50 hover:bg-white/5',
                uploadedImage ? 'p-4' : 'p-12 py-20'
              ]"
              class="glass-card flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 text-center"
              @click="!uploadedImage && triggerFileInput()"
            >
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden" 
                accept="image/*" 
                @change="handleFileChange"
              />

              <!-- Estado: Vacío -->
              <div v-if="!uploadedImage" class="flex flex-col items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center shadow-inner">
                  <Upload class="w-8 h-8 animate-pulse-subtle" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-slate-100">Arrastra tu fotografía aquí</h3>
                  <p class="text-slate-400 text-sm mt-1">O haz clic para explorar en tu dispositivo</p>
                  <p class="text-slate-500 text-xs mt-3">Formatos soportados: JPG, PNG, WEBP (Máx 10MB)</p>
                </div>
              </div>

              <!-- Estado: Imagen cargada -->
              <div v-else class="w-full h-full relative group">
                <img 
                  :src="uploadedImage" 
                  alt="Espacio cargado" 
                  class="w-full max-h-[450px] object-cover rounded-2xl border border-white/5 shadow-2xl"
                />
                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center gap-4">
                  <button 
                    @click.stop="triggerFileInput()"
                    class="bg-indigo-500 hover:bg-indigo-600 p-3 rounded-xl text-white transition-transform duration-200 hover:scale-110 shadow-lg"
                    title="Cambiar imagen"
                  >
                    <RefreshCw class="w-5 h-5" />
                  </button>
                  <button 
                    @click.stop="clearUploadedImage()"
                    class="bg-red-500/20 hover:bg-red-500 border border-red-500/30 p-3 rounded-xl text-red-200 hover:text-white transition-transform duration-200 hover:scale-110 shadow-lg"
                    title="Eliminar imagen"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- FORMULARIO DE PREFERENCIAS (LADO DERECHO) -->
          <div class="lg:col-span-5 flex flex-col gap-6">
            <div class="glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-6">
              <h2 class="text-xl font-bold tracking-tight border-b border-white/5 pb-4 text-slate-100 flex items-center gap-2">
                <Settings class="w-5 h-5 text-indigo-400" />
                Especificaciones del Diseño
              </h2>

              <!-- Tipo de espacio -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-400">¿Qué tipo de espacio es?</label>
                <select v-model="preferences.spaceType" class="glass-input w-full">
                  <option>Sala</option>
                  <option>Comedor</option>
                  <option>Oficina / Estudio</option>
                  <option>Cocina</option>
                  <option>Dormitorio</option>
                </select>
              </div>

              <!-- Estilo estético -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-400">Estilo estético deseado</label>
                <select v-model="preferences.style" class="glass-input w-full">
                  <option>Minimalista</option>
                  <option>Moderno</option>
                  <option>Elegante</option>
                  <option>Lujo</option>
                  <option>Industrial</option>
                </select>
              </div>

              <!-- Colores -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-400">Paleta cromática sugerida</label>
                <input v-model="preferences.colors" type="text" class="glass-input w-full" placeholder="Ej. Gris suave, blanco y toques dorados" />
              </div>

              <!-- Iluminación -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-400">Iluminación preferida</label>
                <input v-model="preferences.lighting" type="text" class="glass-input w-full" placeholder="Ej. Luz natural difusa y lámparas LED" />
              </div>

              <!-- Elementos a incluir -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-400">Elementos clave</label>
                <input v-model="preferences.elements" type="text" class="glass-input w-full" placeholder="Ej. Sofá modular, cuadros grandes" />
              </div>

              <!-- BOTÓN DE GENERACIÓN -->
              <button 
                @click="generateDesign"
                :disabled="!uploadedImage || isGenerating"
                class="glass-btn-primary w-full flex items-center justify-center gap-3 mt-2"
              >
                <Sparkles class="w-5 h-5" />
                <span>{{ isGenerating ? 'Procesando con IA...' : 'Generar Rediseño con IA' }}</span>
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- GENERANDO LOADING SCREEN OVERLAY -->
        <div v-if="isGenerating" class="glass-card p-12 py-20 rounded-3xl flex flex-col items-center justify-center gap-6 max-w-xl w-full mx-auto text-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
          <div class="relative w-24 h-24 flex items-center justify-center">
            <!-- Spinner -->
            <div class="absolute inset-0 rounded-full border-4 border-slate-900 border-t-indigo-500 animate-spin"></div>
            <Sparkles class="w-8 h-8 text-indigo-400 animate-pulse-subtle" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-100">Diseñando espacio...</h3>
            <p class="text-slate-400 text-sm mt-2 transition-all duration-300 max-w-md mx-auto h-12">
              {{ generationLogs[generationStep] }}
            </p>
          </div>
        </div>

        <!-- PANTALLA DE RESULTADOS GENERADOS -->
        <div v-if="designResult" class="flex flex-col gap-8">
          
          <!-- COMPARACIÓN ANTES / DESPUÉS -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- ANTES -->
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">Fotografía Original (Antes)</span>
              <div class="glass-card p-3 rounded-3xl shadow-xl">
                <img :src="uploadedImage" alt="Original" class="w-full h-[400px] object-cover rounded-2xl" />
              </div>
            </div>

            <!-- DESPUÉS -->
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-indigo-400 px-1 flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5" />
                Propuesta de Rediseño IA (Después)
              </span>
              <div class="glass-card p-3 rounded-3xl shadow-xl relative group">
                <img :src="designResult.generated_image" alt="Generado por IA" class="w-full h-[400px] object-cover rounded-2xl" />
                <div class="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    @click="downloadImage(designResult.generated_image, 'rediseño-more-house-ia.png')"
                    class="bg-indigo-500 hover:bg-indigo-600 p-3 rounded-xl text-white shadow-xl flex items-center gap-2 font-semibold text-sm transition-transform duration-200 hover:scale-105"
                  >
                    <Download class="w-4 h-4" />
                    Descargar Render
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- DOSSIER DE ANÁLISIS DE GEMINI -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- ANÁLISIS DE DISEÑO (IZQUIERDA) -->
            <div class="lg:col-span-1 glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-4">
              <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
                <Info class="w-5 h-5 text-indigo-400" />
                Evaluación del Espacio
              </h3>
              <p class="text-slate-300 text-sm leading-relaxed">
                {{ designResult.current_issues }}
              </p>
              
              <div class="bg-indigo-500/10 border border-brand-500/20 p-4 rounded-2xl flex flex-col gap-2 mt-2">
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">Prompt IA Generativo</span>
                <p class="text-xs text-slate-400 italic">
                  "{{ designResult.prompt }}"
                </p>
              </div>

              <button 
                @click="clearUploadedImage()"
                class="glass-btn-secondary w-full text-center py-2.5 mt-2"
              >
                Diseñar Nueva Habitación
              </button>
            </div>

            <!-- PRODUCTOS SELECCIONADOS DEL CATÁLOGO (DERECHA) -->
            <div class="lg:col-span-2 glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-6">
              <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
                <Package class="w-5 h-5 text-indigo-400" />
                Mobiliario Sugerido de More House S.A.
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  v-for="item in designResult.selected_products" 
                  :key="item.id" 
                  class="bg-brand-card/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between"
                >
                  <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between gap-2">
                      <h4 class="font-bold text-slate-100 text-base leading-tight">{{ item.name }}</h4>
                      <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-brand-500/20">
                        ${{ item.details?.price || 'Consultar' }}
                      </span>
                    </div>
                    
                    <p class="text-xs text-slate-400 leading-relaxed italic">
                      "{{ item.justification }}"
                    </p>
                    
                    <div class="text-[11px] text-slate-500 mt-1 flex flex-col gap-1 border-t border-white/5 pt-2">
                      <span v-if="item.details?.dimensions">📏 Medidas: {{ item.details.dimensions }}</span>
                      <span v-if="item.details?.category">🏷️ Categoría: {{ item.details.category }} | Estilo: {{ item.details.style }}</span>
                    </div>
                  </div>

                  <button class="bg-indigo-500 hover:bg-brand-600 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all duration-200 mt-4 flex items-center justify-center gap-1.5 shadow shadow-brand-500/10">
                    <Plus class="w-3.5 h-3.5" />
                    Cotizar Mueble
                  </button>
                </div>
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
              <span class="absolute top-4 right-4 bg-brand-dark/80 backdrop-blur-md border border-white/10 text-brand-500 text-xs font-bold px-3 py-1 rounded-full">
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
            <div class="w-12 h-12 bg-indigo-500/15 border border-brand-500/20 text-brand-500 rounded-xl flex items-center justify-center shadow-inner">
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
    <footer class="mt-auto border-t border-white/5 bg-brand-dark/90 px-6 py-6 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
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

  </div>
</template>
