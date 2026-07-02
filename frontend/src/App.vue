<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { 
  Sparkles, Layout, Grid, Settings, Upload, X, Maximize2, Eye, DollarSign, Info, Package, ChevronLeft, ChevronRight, Download, Sun, Moon
} from 'lucide-vue-next';

// Shared singleton store composable
import { useDesigner } from './composables/useDesigner';

// Modular child components
import SidebarPreferences from './components/SidebarPreferences.vue';
import DesignCanvas from './components/DesignCanvas.vue';
import DesignTimeline from './components/DesignTimeline.vue';
import ProductCatalog from './components/ProductCatalog.vue';
import AdminPanel from './components/AdminPanel.vue';
import QuoteModal from './components/QuoteModal.vue';

const {
  activeTab,
  uploadedImage,
  isUploadingImage,
  triggerFileInput,
  uploadDragOver,
  handleDrop,
  handleFileChange,
  fileInput,
  activeDesign,
  activeDesignId,
  preferences,
  quoteProduct,
  quoteAllProducts,
  isGalleryOpen,
  closeGallery,
  galleryActiveIndex,
  designHistory,
  galleryActiveDesign,
  galleryPrev,
  downloadGalleryDesign,
  galleryActiveDesignId,
  galleryNext,
  selectGalleryDesign,
  selectedProductForPreview,
  closeProductPreview,
  expandedProductImageUrl,
  highResExpandedImageUrl,
  isDarkMode,
  toggleTheme,
  
  // Lifecycles init / destroy
  init,
  destroy
} = useDesigner();

onMounted(() => {
  init();
});

onUnmounted(() => {
  destroy();
});
</script>

<template>
  <div class="min-h-screen flex flex-col relative text-slate-800 dark:text-slate-100 overflow-x-hidden">
    <!-- Fondo dinámico y texturizado con malla/puntos y degradados radiales -->
    <div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-all duration-700">
      <!-- Grid de puntos sutiles (Light/Dark) -->
      <div class="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(99,102,241,0.15)_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>
      
      <!-- Líneas de malla sutiles (Mesh Blueprint) -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.15)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] [background-size:96px_96px]"></div>

      <template v-if="isDarkMode">
        <!-- Blobs oscuros con mayor opacidad y presencia -->
        <div class="absolute top-[-20%] left-[-10%] w-[65vw] h-[65vw] rounded-full bg-indigo-500/[0.15] blur-[130px]"></div>
        <div class="absolute top-[25%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-purple-600/[0.12] blur-[140px]"></div>
        <div class="absolute bottom-[-15%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/[0.22] blur-[120px]"></div>
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]"></div>
      </template>
      <template v-else>
        <!-- Blobs claros más vibrantes pero suaves -->
        <div class="absolute top-[-15%] left-[-5%] w-[55vw] h-[55vw] rounded-full bg-amber-200/35 blur-[100px]"></div>
        <div class="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-200/35 blur-[120px]"></div>
        <div class="absolute bottom-[-10%] left-[15%] w-[45vw] h-[45vw] rounded-full bg-rose-200/30 blur-[90px]"></div>
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.08),transparent_60%)]"></div>
      </template>
    </div>

    <!-- NAVBAR FLOTANTE ULTRA-MINIMALISTA DE DISEÑO -->
    <header class="sticky top-0 z-50 px-4 md:px-8 pt-5 pb-3">
      <nav class="glass-nav max-w-7xl mx-auto px-5 md:px-7 py-3.5 flex items-center justify-between gap-4 transition-all duration-300">
        <div class="flex items-center gap-3.5">
          <div class="bg-gradient-to-br from-indigo-500/25 to-violet-600/15 border border-indigo-400/25 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-300 flex items-center justify-center shadow-glow-indigo">
            <Sparkles class="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div class="flex items-center gap-2.5">
            <span class="font-extrabold text-lg md:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-indigo-600 dark:from-white dark:via-slate-200 dark:to-indigo-300 bg-clip-text text-transparent">More House</span>
            <span class="hidden sm:inline text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300/90 border border-indigo-500/20 px-2.5 py-1 rounded-full">Decor IA</span>
          </div>
        </div>

        <!-- TABS DE NAVEGACIÓN -->
        <div class="flex gap-1 bg-slate-200/60 dark:bg-slate-950/50 border border-slate-300/30 dark:border-white/10 p-1 rounded-full backdrop-blur-sm">
          <button 
            @click="activeTab = 'designer'"
            :class="activeTab === 'designer' ? 'nav-tab-active' : 'nav-tab'"
          >
            <Layout class="w-4 h-4" />
            <span class="hidden sm:inline font-semibold">Diseñador IA</span>
          </button>
          <button 
            @click="activeTab = 'catalog'"
            :class="activeTab === 'catalog' ? 'nav-tab-active' : 'nav-tab'"
          >
            <Grid class="w-4 h-4" />
            <span class="hidden sm:inline font-semibold">Catálogo</span>
          </button>
          <button 
            @click="activeTab = 'admin'"
            :class="activeTab === 'admin' ? 'nav-tab-active' : 'nav-tab'"
          >
            <Settings class="w-4 h-4" />
            <span class="hidden sm:inline font-semibold">Admin</span>
          </button>
        </div>

        <!-- THEME SWITCH TOGGLE SLIDER -->
        <div class="flex items-center gap-3">
          <button 
            @click="toggleTheme" 
            class="relative inline-flex h-9 w-16 items-center justify-between rounded-full bg-slate-200 dark:bg-slate-950 p-1 border border-slate-300/40 dark:border-white/10 transition-colors duration-500 cursor-pointer shadow-inner focus:outline-none"
            title="Cambiar Tema"
          >
            <!-- Slider background transition indicator -->
            <span 
              :class="isDarkMode ? 'translate-x-7 bg-indigo-600' : 'translate-x-0 bg-amber-400'"
              class="absolute left-1 h-7 w-7 transform rounded-full transition-transform duration-500 ease-out shadow-md flex items-center justify-center text-white"
            >
              <Moon v-if="isDarkMode" class="w-3.5 h-3.5" />
              <Sun v-else class="w-4 h-4 text-white" />
            </span>
            <div class="w-full flex justify-between px-2 text-slate-400 dark:text-slate-600 pointer-events-none select-none">
              <Sun :class="isDarkMode ? 'opacity-60' : 'opacity-0'" class="w-3.5 h-3.5 transition-opacity duration-300" />
              <Moon :class="isDarkMode ? 'opacity-0' : 'opacity-60'" class="w-3.5 h-3.5 transition-opacity duration-300" />
            </div>
          </button>
        </div>
      </nav>
    </header>

    <!-- CONTENEDOR PRINCIPAL CON TRANSICIONES -->
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 pb-8 flex flex-col justify-start">
      
      <!-- 1. TAB: DISEÑADOR IA -->
      <section v-if="activeTab === 'designer'" class="flex-grow flex flex-col gap-8 animate-slide-up">
        
        <!-- ENCABEZADO -->
        <div class="text-center max-w-2xl mx-auto mb-6 pt-2">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent leading-tight">
            Rediseña tus Espacios con IA
          </h1>
          <p class="text-slate-600 dark:text-slate-400/90 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Sube una fotografía de tu habitación, especifica tus preferencias estéticas y decora con fotorrealismo por turnos agregando productos de catálogo.
          </p>
        </div>

        <!-- ZONA DE SUBIDA (Si no hay imagen) -->
        <div v-if="!uploadedImage" class="max-w-2xl w-full mx-auto">
          <div 
            @click="!isUploadingImage && triggerFileInput()"
            @dragover.prevent="!isUploadingImage && (uploadDragOver = true)"
            @dragleave.prevent="uploadDragOver = false"
            @drop.prevent="!isUploadingImage && handleDrop($event)"
            :class="[
              uploadDragOver ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5' : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-100/50 dark:hover:bg-white/5',
              isUploadingImage ? 'opacity-85 cursor-wait' : 'cursor-pointer'
            ]"
            class="glass-card p-12 py-24 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all duration-500 text-center select-none hover:shadow-glow-indigo"
          >
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden" 
              accept="image/*" 
              @change="handleFileChange"
              :disabled="isUploadingImage"
            />
            
            <!-- Estado: Subiendo -->
            <div v-if="isUploadingImage" class="flex flex-col items-center gap-4">
              <div class="relative w-16 h-16 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-900 border-t-indigo-500 dark:border-t-indigo-500 animate-spin"></div>
                <Upload class="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse-subtle" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Subiendo imagen al almacenamiento R2...</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Espera un momento mientras guardamos tu foto en Cloudflare</p>
              </div>
            </div>

            <!-- Estado: Esperando archivo -->
            <div v-else class="flex flex-col items-center">
              <div class="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner mb-4">
                <Upload class="w-8 h-8 animate-pulse-subtle" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Arrastra tu fotografía aquí</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">O haz clic para explorar en tu dispositivo</p>
                <p class="text-slate-400 dark:text-slate-500 text-xs mt-3">Formatos soportados: JPG, PNG, WEBP, AVIF (Máx 10MB)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- WORKSPACE DEL DISEÑADOR (Si ya hay imagen cargada) -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          
          <!-- COLUMNA 1: CONTROLES DE ESPECIFICACIONES (ASIMÉTRICO / FLOTANTE) -->
          <SidebarPreferences class="lg:col-span-4" />

          <!-- COLUMNA 2: VISOR PRINCIPAL Y HISTORIAL TIMELINE (PROTAGONISTA CENTRAL) -->
          <div class="lg:col-span-5 flex flex-col gap-6 relative">
            <!-- Glow detrás del lienzo para profundidad 3D -->
            <div class="absolute inset-0 -m-8 pointer-events-none -z-10 rounded-[40px] opacity-60 dark:opacity-40 blur-[80px] bg-gradient-to-tr from-indigo-500/30 to-violet-600/20 dark:from-indigo-600/20 dark:to-violet-500/10"></div>
            <DesignCanvas />
            <DesignTimeline />
          </div>

          <!-- COLUMNA 3: EVALUACIÓN Y COTIZACIÓN ACUMULADA -->
          <div class="lg:col-span-3 flex flex-col gap-6">
            <!-- Evaluación del Espacio -->
            <div class="glass-card p-7 rounded-3xl flex flex-col gap-4">
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5 border-b border-slate-200 dark:border-white/10 pb-3">
                <div class="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-400/20">
                  <Info class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Evaluación del Espacio
              </h3>
              <p class="text-xs text-slate-600 dark:text-slate-300/90 leading-relaxed max-h-40 overflow-y-auto scrollbar-thin">
                {{ activeDesign?.currentIssues || 'Sube una habitación y genera tu primer diseño para ver la evaluación automática de la IA.' }}
              </p>
              
              <div v-if="activeDesign?.prompt" class="bg-indigo-500/[0.03] dark:bg-indigo-500/[0.06] border border-indigo-500/10 dark:border-indigo-400/15 p-4 rounded-2xl flex flex-col gap-1.5 mt-1">
                <span class="text-[9px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400/90">Prompt de Imagen Generado</span>
                <p class="text-[10px] text-slate-500 dark:text-slate-400/90 italic line-clamp-3 hover:line-clamp-none transition-all duration-300 cursor-pointer leading-relaxed">
                  "{{ activeDesign.prompt }}"
                </p>
              </div>
            </div>

            <!-- Carrito de Cotización Acumulado -->
            <div class="glass-card p-7 rounded-3xl flex flex-col gap-5 flex-grow justify-between">
              <div class="flex flex-col gap-4">
                <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5 border-b border-slate-200 dark:border-white/10 pb-3">
                  <div class="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-400/20">
                    <Package class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Mobiliario en este Diseño
                </h3>
                
                <div class="flex flex-col gap-2.5 max-h-60 overflow-y-auto scrollbar-thin">
                  <div 
                    v-for="item in activeDesign?.products || []" 
                    :key="item.id"
                    class="flex items-center justify-between p-3 rounded-2xl bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-indigo-500/20 transition-colors duration-300"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <img :src="item.details?.image" class="w-7 h-7 object-cover rounded border border-slate-200 dark:border-white/10" />
                      <div class="min-w-0">
                        <p class="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{{ item.name }}</p>
                        <p class="text-[8px] text-slate-500 dark:text-slate-500 truncate italic">"{{ item.justification.substring(0, 45) }}..."</p>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0 flex flex-col items-end gap-0.5">
                      <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">${{ item.details?.price || 0 }}</span>
                      <button @click="quoteProduct(item.details)" class="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline">
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
              <div v-if="activeDesign && activeDesign.products.length > 0" class="border-t border-slate-200 dark:border-white/10 pt-4 mt-2 flex flex-col gap-4">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Total Cotización</span>
                  <span class="text-lg font-black text-indigo-600 dark:text-transparent dark:bg-gradient-to-r dark:from-indigo-300 dark:to-violet-300 dark:bg-clip-text">
                    ${{ activeDesign.products.reduce((acc: number, p: any) => acc + (p.details?.price || 0), 0) }}
                  </span>
                </div>
                <button 
                  @click="quoteAllProducts" 
                  class="glass-btn-primary w-full text-xs py-3 flex items-center justify-center gap-2"
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
      <ProductCatalog />

      <!-- 3. TAB: ADMIN -->
      <AdminPanel />

    </main>

    <!-- FOOTER PREMIUM -->
    <footer class="mt-auto border-t border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md px-6 py-7 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <span>&copy; 2026 More House S.A. Todos los derechos reservados.</span>
      </div>
      <div class="flex items-center gap-2 text-slate-400 dark:text-slate-600">
        <span>Código de Proyecto: MHD-IA-2026-01</span>
        <span>|</span>
        <span>Powered by Bun, Elysia, Vue & Tailwind</span>
      </div>
    </footer>

    <!-- MODALES Y LIGHTBOXES DE APLICACIÓN -->
    <QuoteModal />

    <!-- MODAL GALERÍA DE ITERACIONES LIGHTBOX (FULL-SCREEN PREMIUM) -->
    <div 
      v-if="isGalleryOpen" 
      class="fixed inset-0 z-50 flex flex-col justify-between bg-slate-50/98 dark:bg-[#090d16]/95 backdrop-blur-xl p-5 md:p-8 animate-fade-in"
      @click.self="closeGallery"
    >
      <!-- Cabecera de la Galería -->
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-5">
        <div class="flex items-center gap-4">
          <div class="bg-gradient-to-br from-indigo-500/25 to-violet-600/15 border border-indigo-400/25 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-300 shadow-glow-indigo">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Galería de Iteraciones
              <span class="text-xs bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Etapa {{ galleryActiveIndex }} de {{ designHistory.length - 1 }}
              </span>
            </h3>
            <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{{ galleryActiveDesign?.label }}</p>
          </div>
        </div>

        <button 
          @click="closeGallery" 
          class="p-2.5 rounded-xl bg-slate-200/50 dark:bg-white/[0.04] border border-slate-300/40 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all duration-300 hover:scale-102"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Área de Contenido Principal -->
      <div class="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 min-h-0">
        <!-- COLUMNA RENDER CENTRAL -->
        <div class="lg:col-span-8 flex items-center justify-between gap-4 h-full min-h-0">
          <button 
            @click="galleryPrev" 
            :disabled="galleryActiveIndex <= 0"
            class="p-4 rounded-full bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-lg flex-shrink-0 hover:scale-102"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>

          <div class="flex-grow h-full max-h-[65vh] rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden flex items-center justify-center relative shadow-float-card group">
            <img 
              v-if="galleryActiveDesign?.imageUrl"
              :src="galleryActiveDesign.imageUrl" 
              class="w-full h-full object-contain"
            />
            <button 
              v-if="galleryActiveDesignId !== 'original'"
              @click.stop="downloadGalleryDesign"
              class="absolute bottom-5 right-5 glass-btn-primary px-5 py-2.5 text-xs flex items-center gap-2 border border-slate-200 dark:border-white/10"
            >
              <Download class="w-3.5 h-3.5" />
              Descargar este Render
            </button>
          </div>

          <button 
            @click="galleryNext" 
            :disabled="galleryActiveIndex >= designHistory.length - 1"
            class="p-4 rounded-full bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-lg flex-shrink-0 hover:scale-102"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
        </div>

        <!-- COLUMNA DETALLES Y PRESUPUESTO -->
        <div class="lg:col-span-4 flex flex-col gap-5 h-full min-h-0 overflow-y-auto pr-2 scrollbar-thin">
          <div class="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col gap-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Info class="w-4 h-4" />
              Detalles de la Iteración
            </h4>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between text-xs border-b border-slate-200 dark:border-white/5 pb-2">
                <span class="text-slate-400">Etapa:</span>
                <span class="text-slate-800 dark:text-slate-200 font-bold">{{ galleryActiveIndex === 0 ? 'Habitación Original' : `Propuesta ${galleryActiveIndex}` }}</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                {{ galleryActiveDesign?.currentIssues || 'Fotografía base cargada por el usuario.' }}
              </p>
            </div>
            
            <div v-if="galleryActiveDesign?.prompt" class="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl flex flex-col gap-1 mt-1">
              <span class="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Prompt Generado para FLUX.2</span>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 italic">
                "{{ galleryActiveDesign.prompt }}"
              </p>
            </div>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col gap-3 flex-grow min-h-0">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Package class="w-4 h-4" />
              Muebles Colocados hasta este turno
            </h4>
            
            <div class="flex flex-col gap-2 overflow-y-auto scrollbar-thin max-h-52">
              <div 
                v-for="item in galleryActiveDesign?.products || []" 
                :key="item.id"
                class="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <img :src="item.details?.image" class="w-8 h-8 object-cover rounded border border-slate-200 dark:border-white/10" />
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{{ item.name }}</p>
                    <p class="text-[8px] text-slate-500 truncate italic">"{{ item.justification }}"</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">${{ item.details?.price || 0 }}</span>
                </div>
              </div>
              <div v-if="!galleryActiveDesign || galleryActiveDesign.products.length === 0" class="text-center py-8 text-xs text-slate-500 italic">
                Sin muebles agregados todavía.
              </div>
            </div>

            <div v-if="galleryActiveDesign && galleryActiveDesign.products.length > 0" class="border-t border-slate-200 dark:border-white/5 pt-3 mt-auto flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-500 dark:text-slate-400">Presupuesto Acumulado:</span>
              <span class="text-sm font-extrabold text-indigo-600 dark:text-indigo-300">
                ${{ galleryActiveDesign.products.reduce((acc, p) => acc + (p.details?.price || 0), 0) }} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra Inferior -->
      <div class="border-t border-slate-200 dark:border-white/5 pt-4">
        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 text-center">Hacer clic en cualquier miniatura para saltar a esa iteración</span>
        <div class="flex justify-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          <div 
            v-for="(design, index) in designHistory" 
            :key="design.id"
            @click="selectGalleryDesign(design.id)"
            :class="[
              galleryActiveDesignId === design.id ? 'border-indigo-500 dark:border-indigo-400/70 ring-1 ring-indigo-500 dark:ring-indigo-400/40 shadow-glow-indigo scale-[1.03]' : 'border-slate-200 dark:border-white/10 opacity-55 hover:opacity-100 hover:scale-[1.02] hover:border-slate-300 dark:hover:border-white/20'
            ]"
            class="flex-shrink-0 w-28 border rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-slate-900/70 backdrop-blur-sm transition-all duration-300 ease-out"
          >
            <div class="h-14 w-full relative">
              <img :src="design.imageUrl" class="w-full h-full object-cover" />
              <span class="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[8px] font-bold text-slate-300">
                {{ index === 0 ? 'Vacío' : `Etapa ${index}` }}
              </span>
            </div>
            <div class="p-1 text-center border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950">
              <p class="text-[9px] font-bold text-slate-800 dark:text-slate-300 truncate px-0.5">{{ design.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLE DE PRODUCTO PREMIUM (FICHA TÉCNICA) -->
    <div 
      v-if="selectedProductForPreview" 
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 dark:bg-[#090d16]/90 backdrop-blur-xl p-4 animate-fade-in"
      @click.self="closeProductPreview"
    >
      <div class="glass-card max-w-2xl w-full p-7 md:p-9 rounded-3xl flex flex-col md:flex-row gap-7 relative border border-slate-200 dark:border-white/10 shadow-float-card animate-scale-up">
        <button 
          @click="closeProductPreview" 
          class="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-all z-10"
        >
          <X class="w-4 h-4" />
        </button>

        <div 
          @click="expandedProductImageUrl = selectedProductForPreview.image"
          class="w-full md:w-1/2 aspect-square md:aspect-auto md:h-[350px] rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0 cursor-zoom-in group/prodimg relative"
          title="Hacer clic para ampliar imagen"
        >
          <img 
            :src="selectedProductForPreview.image" 
            :alt="selectedProductForPreview.name" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover/prodimg:scale-105"
          />
          <div class="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/prodimg:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div class="bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-300 shadow-xl flex items-center gap-1.5 transform scale-90 group-hover/prodimg:scale-100 transition-all duration-300">
              <Maximize2 class="w-4 h-4" />
              <span class="text-xs font-semibold">Ampliar Foto</span>
            </div>
          </div>
        </div>

        <div class="w-full md:w-1/2 flex flex-col justify-between py-2">
          <div class="flex flex-col gap-4">
            <div class="flex wrap gap-2">
              <span class="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {{ selectedProductForPreview.category }}
              </span>
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {{ selectedProductForPreview.style }}
              </span>
            </div>

            <div>
              <h3 class="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                {{ selectedProductForPreview.name }}
              </h3>
              <p class="text-xl font-black text-indigo-600 dark:text-indigo-300 mt-1.5">
                ${{ selectedProductForPreview.price }} USD
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dimensiones</span>
              <span class="text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 px-3 py-1.5 rounded-xl w-fit">
                📏 {{ selectedProductForPreview.dimensions }}
              </span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Descripción</span>
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto scrollbar-thin">
                {{ selectedProductForPreview.description || 'Sin descripción detallada disponible.' }}
              </p>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex gap-2">
            <button 
              @click="quoteProduct(selectedProductForPreview)" 
              class="flex-grow glass-btn-primary py-3 text-xs flex items-center justify-center gap-2"
            >
              <DollarSign class="w-3.5 h-3.5" />
              Cotizar Mueble
            </button>
            <button 
              @click="closeProductPreview" 
              class="glass-btn-secondary py-2.5 px-4 text-xs font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- LIGHTBOX AMPLIAR IMAGEN DE PRODUCTO (FULL SCREEN) -->
    <div 
      v-if="expandedProductImageUrl" 
      class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-100/98 dark:bg-slate-950/98 backdrop-blur-md p-4 cursor-zoom-out animate-fade-in"
      @click="expandedProductImageUrl = null"
    >
      <button 
        @click="expandedProductImageUrl = null" 
        class="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-250 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer z-50"
      >
        <X class="w-5 h-5" />
      </button>
      <img 
        :src="highResExpandedImageUrl" 
        class="max-w-[95vw] max-h-[85vh] md:max-w-[80vw] md:max-h-[80vh] w-auto h-auto object-contain rounded-3xl shadow-2xl select-none border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50"
      />
    </div>

  </div>
</template>

<style>
@media print {
  body {
    background: white !important;
    color: black !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  nav, main, footer, .print-invoice-modal {
    display: none !important;
  }

  .print-pages-container {
    display: block !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    z-index: 9999 !important;
  }

  .print-page {
    page-break-after: always !important;
    break-after: page !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 1.5cm !important;
    background: white !important;
    color: #1e293b !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}
</style>
