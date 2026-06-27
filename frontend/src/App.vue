<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { 
  Sparkles, Layout, Grid, Settings, Upload, X, Maximize2, Eye, DollarSign, Info, Package, ChevronLeft, ChevronRight, Download
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
          <span class="text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full ml-2">Decor IA</span>
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
          @click="activeTab = 'admin'"
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
            @click="!isUploadingImage && triggerFileInput()"
            @dragover.prevent="!isUploadingImage && (uploadDragOver = true)"
            @dragleave.prevent="uploadDragOver = false"
            @drop.prevent="!isUploadingImage && handleDrop($event)"
            :class="[
              uploadDragOver ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5',
              isUploadingImage ? 'opacity-85 cursor-wait' : 'cursor-pointer'
            ]"
            class="glass-card p-12 py-24 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all duration-300 text-center select-none"
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
                <div class="absolute inset-0 rounded-full border-4 border-slate-900 border-t-indigo-500 animate-spin"></div>
                <Upload class="w-6 h-6 text-indigo-400 animate-pulse-subtle" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-100">Subiendo imagen al almacenamiento R2...</h3>
                <p class="text-slate-400 text-sm mt-1">Espera un momento mientras guardamos tu foto en Cloudflare</p>
              </div>
            </div>

            <!-- Estado: Esperando archivo -->
            <div v-else class="flex flex-col items-center">
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
        </div>

        <!-- WORKSPACE DEL DISEÑADOR (Si ya hay imagen cargada) -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- COLUMNA 1: CONTROLES DE ESPECIFICACIONES -->
          <SidebarPreferences />

          <!-- COLUMNA 2: VISOR PRINCIPAL Y HISTORIAL TIMELINE -->
          <div class="lg:col-span-5 flex flex-col gap-6">
            <DesignCanvas />
            <DesignTimeline />
          </div>

          <!-- COLUMNA 3: EVALUACIÓN Y COTIZACIÓN ACUMULADA -->
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
      <ProductCatalog />

      <!-- 3. TAB: ADMIN -->
      <AdminPanel />

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

    <!-- MODALES Y LIGHTBOXES DE APLICACIÓN -->
    <QuoteModal />

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

      <!-- Área de Contenido Principal -->
      <div class="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 min-h-0">
        <!-- COLUMNA RENDER CENTRAL -->
        <div class="lg:col-span-8 flex items-center justify-between gap-4 h-full min-h-0">
          <button 
            @click="galleryPrev" 
            :disabled="galleryActiveIndex <= 0"
            class="p-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed border border-white/10 transition-all shadow-lg flex-shrink-0"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>

          <div class="flex-grow h-full max-h-[65vh] rounded-3xl border border-white/10 bg-slate-900 overflow-hidden flex items-center justify-center relative shadow-2xl group">
            <img 
              v-if="galleryActiveDesign?.imageUrl"
              :src="galleryActiveDesign.imageUrl" 
              class="w-full h-full object-contain"
            />
            <button 
              v-if="galleryActiveDesignId !== 'original'"
              @click.stop="downloadGalleryDesign"
              class="absolute bottom-4 right-4 bg-indigo-500 hover:bg-indigo-600 px-4 py-2.5 rounded-xl text-white shadow-lg flex items-center gap-1.5 font-bold text-xs border border-white/10 transition-all hover:scale-105"
            >
              <Download class="w-3.5 h-3.5" />
              Descargar este Render
            </button>
          </div>

          <button 
            @click="galleryNext" 
            :disabled="galleryActiveIndex >= designHistory.length - 1"
            class="p-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed border border-white/10 transition-all shadow-lg flex-shrink-0"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
        </div>

        <!-- COLUMNA DETALLES Y PRESUPUESTO -->
        <div class="lg:col-span-4 flex flex-col gap-5 h-full min-h-0 overflow-y-auto pr-2 scrollbar-thin">
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
            
            <div v-if="galleryActiveDesign?.prompt" class="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl flex flex-col gap-1 mt-1">
              <span class="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Prompt Generado para FLUX.2</span>
              <p class="text-[10px] text-slate-400 italic">
                "{{ galleryActiveDesign.prompt }}"
              </p>
            </div>
          </div>

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

            <div v-if="galleryActiveDesign && galleryActiveDesign.products.length > 0" class="border-t border-white/5 pt-3 mt-auto flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-400">Presupuesto Acumulado:</span>
              <span class="text-sm font-extrabold text-indigo-300">
                ${{ galleryActiveDesign.products.reduce((acc, p) => acc + (p.details?.price || 0), 0) }} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra Inferior -->
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

    <!-- MODAL DETALLE DE PRODUCTO PREMIUM (FICHA TÉCNICA) -->
    <div 
      v-if="selectedProductForPreview" 
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      @click.self="closeProductPreview"
    >
      <div class="glass-card max-w-2xl w-full p-6 md:p-8 rounded-3xl flex flex-col md:flex-row gap-6 relative border border-white/10 shadow-2xl animate-scale-up">
        <button 
          @click="closeProductPreview" 
          class="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all z-10"
        >
          <X class="w-4 h-4" />
        </button>

        <div 
          @click="expandedProductImageUrl = selectedProductForPreview.image"
          class="w-full md:w-1/2 aspect-square md:aspect-auto md:h-[350px] rounded-2xl border border-white/10 bg-slate-900 overflow-hidden flex-shrink-0 cursor-zoom-in group/prodimg relative"
          title="Hacer clic para ampliar imagen"
        >
          <img 
            :src="selectedProductForPreview.image" 
            :alt="selectedProductForPreview.name" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover/prodimg:scale-105"
          />
          <div class="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/prodimg:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div class="bg-slate-950/80 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-indigo-300 shadow-xl flex items-center gap-1.5 transform scale-90 group-hover/prodimg:scale-100 transition-all duration-300">
              <Maximize2 class="w-4 h-4" />
              <span class="text-xs font-semibold">Ampliar Foto</span>
            </div>
          </div>
        </div>

        <div class="w-full md:w-1/2 flex flex-col justify-between py-2">
          <div class="flex flex-col gap-4">
            <div class="flex wrap gap-2">
              <span class="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {{ selectedProductForPreview.category }}
              </span>
              <span class="text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {{ selectedProductForPreview.style }}
              </span>
            </div>

            <div>
              <h3 class="text-xl font-extrabold text-slate-100 tracking-tight leading-tight">
                {{ selectedProductForPreview.name }}
              </h3>
              <p class="text-xl font-black text-indigo-300 mt-1.5">
                ${{ selectedProductForPreview.price }} USD
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dimensiones</span>
              <span class="text-xs text-slate-300 font-medium bg-slate-950/40 border border-white/5 px-3 py-1.5 rounded-xl w-fit">
                📏 {{ selectedProductForPreview.dimensions }}
              </span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descripción</span>
              <p class="text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto scrollbar-thin">
                {{ selectedProductForPreview.description || 'Sin descripción detallada disponible.' }}
              </p>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-white/5 flex gap-2">
            <button 
              @click="quoteProduct(selectedProductForPreview)" 
              class="flex-grow bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow"
            >
              <DollarSign class="w-3.5 h-3.5" />
              Cotizar Producto
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
      class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/98 backdrop-blur-md p-4 cursor-zoom-out animate-fade-in"
      @click="expandedProductImageUrl = null"
    >
      <button 
        @click="expandedProductImageUrl = null" 
        class="absolute top-4 right-4 p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer z-50"
      >
        <X class="w-5 h-5" />
      </button>
      <img 
        :src="highResExpandedImageUrl" 
        class="max-w-[95vw] max-h-[85vh] md:max-w-[80vw] md:max-h-[80vh] w-auto h-auto object-contain rounded-3xl shadow-2xl select-none border border-white/10 bg-slate-900/50"
      />
    </div>

  </div>
</template>

<style>
@media print {
  /* Hojas de impresión limpias y fondo blanco para PDF formal */
  body {
    background: white !important;
    color: black !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* Ocultar toda la interfaz interactiva en la impresión */
  nav, main, footer, .print-invoice-modal {
    display: none !important;
  }

  /* Mostrar y dar formato al contenedor de cotizaciones por etapas */
  .print-pages-container {
    display: block !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    z-index: 9999 !important;
  }

  /* Salto de página para cada factura de etapa */
  .print-page {
    page-break-after: always !important;
    break-after: page !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 1.5cm !important;
    background: white !important;
    color: #1e293b !important; /* slate-800 */
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}
</style>
