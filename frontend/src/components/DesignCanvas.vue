<script setup lang="ts">
import { Sparkles, Maximize2, Eye, Download, Trash2 } from 'lucide-vue-next';
import { useDesigner } from '../composables/useDesigner';

const { 
  activeDesignId, 
  isGenerating, 
  showComparison, 
  comparisonMode, 
  designHistory, 
  activeDesign, 
  sliderPosition, 
  startDrag, 
  beforeImageUrl, 
  openGallery, 
  uploadedImage, 
  generationLogs, 
  generationStep, 
  downloadDesign, 
  clearUploadedImage 
} = useDesigner();
</script>

<template>
  <div class="lg:col-span-5 flex flex-col gap-6">
    <div class="glass-card p-4 rounded-3xl flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-white/5 pb-3 flex-wrap gap-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 animate-pulse-subtle">
          <Sparkles class="w-3.5 h-3.5" />
          Visor de Diseño
        </span>
        
        <div class="flex items-center gap-2">
          <!-- Botón Comparar -->
          <button 
            v-if="activeDesignId !== 'original' && activeDesignId && !isGenerating"
            @click="showComparison = !showComparison"
            :class="[
              showComparison ? 'bg-indigo-500 text-white border-indigo-400/30' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            ]"
            class="px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            <span>Comparar</span>
          </button>

          <!-- Selector de Modo de Comparación -->
          <div 
            v-if="showComparison && activeDesignId !== 'original' && activeDesignId && !isGenerating"
            class="flex bg-slate-900 border border-white/10 rounded-lg p-0.5"
          >
            <button 
              @click="comparisonMode = 'original'"
              :class="[comparisonMode === 'original' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300']"
              class="px-1.5 py-0.5 rounded text-[8px] font-extrabold transition-all cursor-pointer"
            >
              Original
            </button>
            <button 
              v-if="designHistory.findIndex(d => d.id === activeDesignId) > 1"
              @click="comparisonMode = 'previous'"
              :class="[comparisonMode === 'previous' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300']"
              class="px-1.5 py-0.5 rounded text-[8px] font-extrabold transition-all cursor-pointer"
            >
              Anterior
            </button>
          </div>

          <span class="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold">
            {{ activeDesign?.label }}
          </span>
        </div>
      </div>

      <!-- Contenedor del Visor -->
      <div class="relative w-full aspect-[4/3] rounded-2xl border border-white/5 bg-slate-950 overflow-hidden flex items-center justify-center">
        <!-- MODO COMPARADOR ANTES/DESPUÉS -->
        <div 
          v-if="showComparison && activeDesign?.imageUrl && !isGenerating" 
          class="w-full h-full relative select-none comparison-slider-container overflow-hidden cursor-ew-resize"
          @mousedown="startDrag"
          @touchstart="startDrag"
        >
          <!-- Imagen Después (Fondo) -->
          <img 
            :src="activeDesign.imageUrl" 
            class="w-full h-full object-cover pointer-events-none"
            alt="Después"
          />
          
          <!-- Imagen Antes (Clipped via clip-path to prevent squishing) -->
          <img 
            :src="beforeImageUrl" 
            class="absolute inset-0 w-full h-full object-cover pointer-events-none"
            :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }"
            alt="Antes"
          />
          
          <!-- Tirador del Slider -->
          <div 
            class="absolute top-0 bottom-0 w-0.5 bg-indigo-500 cursor-ew-resize flex items-center justify-center z-20"
            :style="{ left: sliderPosition + '%' }"
          >
            <div class="w-7 h-7 rounded-full bg-indigo-600 border border-white/20 flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
            </div>
          </div>

          <!-- Etiquetas de comparación -->
          <span class="absolute left-3 top-3 px-2 py-1 bg-slate-950/80 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-300 z-10">Antes</span>
          <span class="absolute right-3 top-3 px-2 py-1 bg-slate-950/80 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider text-indigo-300 z-10">Después</span>
        </div>

        <!-- MODO NORMAL (Render clickeable) -->
        <div 
          v-else-if="activeDesign?.imageUrl"
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
    </div>
  </div>
</template>
