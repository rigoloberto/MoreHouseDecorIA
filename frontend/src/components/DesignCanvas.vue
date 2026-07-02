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
  <div class="flex flex-col gap-6 w-full">
    <div class="glass-card p-5 rounded-3xl flex flex-col gap-5">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 flex-wrap gap-3">
        <span class="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400/90 flex items-center gap-2 animate-pulse-subtle">
          <Sparkles class="w-3.5 h-3.5" />
          Visor de Diseño
        </span>
        
        <div class="flex items-center gap-2.5">
          <!-- Botón Comparar -->
          <button 
            v-if="activeDesignId !== 'original' && activeDesignId && !isGenerating"
            @click="showComparison = !showComparison"
            :class="[
              showComparison ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30 dark:bg-indigo-500/25 dark:text-indigo-200 dark:border-indigo-400/40 shadow-glow-indigo' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-500 border-slate-200/80 hover:text-slate-800 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-slate-400 dark:border-white/10 dark:hover:text-slate-200'
            ]"
            class="px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-102"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            <span>Comparar</span>
          </button>

          <!-- Selector de Modo de Comparación -->
          <div 
            v-if="showComparison && activeDesignId !== 'original' && activeDesignId && !isGenerating"
            class="segment-control !p-0.5 !rounded-xl"
          >
            <button 
              @click="comparisonMode = 'original'"
              :class="comparisonMode === 'original' ? 'segment-option-active !py-1.5 !px-2.5 !text-[9px]' : 'segment-option !py-1.5 !px-2.5 !text-[9px]'"
            >
              Original
            </button>
            <button 
              v-if="designHistory.findIndex(d => d.id === activeDesignId) > 1"
              @click="comparisonMode = 'previous'"
              :class="comparisonMode === 'previous' ? 'segment-option-active !py-1.5 !px-2.5 !text-[9px]' : 'segment-option !py-1.5 !px-2.5 !text-[9px]'"
            >
              Anterior
            </button>
          </div>

          <span class="text-[10px] bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-400/20 px-3 py-1 rounded-full font-bold">
            {{ activeDesign?.label }}
          </span>
        </div>
      </div>

      <!-- Contenedor del Visor -->
      <div class="relative w-full aspect-[4/3] rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950/80 overflow-hidden flex items-center justify-center shadow-inner">
        <!-- MODO COMPARADOR ANTES/DESPUÉS -->
        <div 
          v-if="showComparison && activeDesign?.imageUrl && !isGenerating" 
          class="absolute inset-0 select-none comparison-slider-container overflow-hidden cursor-ew-resize"
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
          
          <!-- Tirador del Slider — línea 1px índigo + botón circular minimalista -->
          <div 
            class="absolute top-0 bottom-0 w-px bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_14px_rgba(129,140,248,0.7)] cursor-ew-resize flex items-center justify-center z-20"
            :style="{ left: sliderPosition + '%' }"
          >
            <div class="w-9 h-9 rounded-full bg-white dark:bg-slate-950/90 backdrop-blur-md border border-indigo-500 dark:border-indigo-400/60 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-[0_0_24px_rgba(99,102,241,0.25)] dark:shadow-[0_0_24px_rgba(99,102,241,0.35)] hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15M8.25 9 12 5.25 15.75 9" />
              </svg>
            </div>
          </div>

          <!-- Etiquetas de comparación -->
          <span class="absolute left-4 top-4 px-2.5 py-1 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 z-10">Antes</span>
          <span class="absolute right-4 top-4 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/20 backdrop-blur-md border border-indigo-200 dark:border-indigo-400/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300 z-10">Después</span>
        </div>

        <!-- MODO NORMAL (Render clickeable) -->
        <div 
          v-else-if="activeDesign?.imageUrl"
          @click="openGallery(activeDesignId)"
          class="absolute inset-0 cursor-zoom-in group/visor select-none"
        >
          <img 
            :src="activeDesign.imageUrl" 
            alt="Visor de Staging" 
            class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/visor:scale-[1.015]"
          />
          <!-- Hover overlay con icono de ampliar y galería -->
          <div class="absolute inset-0 bg-white/30 dark:bg-slate-950/30 opacity-0 group-hover/visor:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
            <div class="bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl text-indigo-600 dark:text-indigo-300 shadow-glow-indigo flex items-center gap-2.5 transform scale-95 group-hover/visor:scale-100 transition-all duration-300">
              <Maximize2 class="w-4 h-4" />
              <span class="text-xs font-bold tracking-wide">Ver Galería / Ampliar</span>
            </div>
          </div>
        </div>

        <!-- Imagen Original clickeable -->
        <div 
          v-else-if="uploadedImage"
          @click="openGallery('original')"
          class="absolute inset-0 cursor-zoom-in group/visor select-none"
        >
          <img 
            :src="uploadedImage" 
            alt="Habitación Original" 
            class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/visor:scale-[1.015]"
          />
          <div class="absolute inset-0 bg-white/30 dark:bg-slate-950/30 opacity-0 group-hover/visor:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
            <div class="bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl text-indigo-600 dark:text-indigo-300 shadow-glow-indigo flex items-center gap-2.5 transform scale-95 group-hover/visor:scale-100 transition-all duration-300">
              <Maximize2 class="w-4 h-4" />
              <span class="text-xs font-bold tracking-wide">Ver Galería / Ampliar</span>
            </div>
          </div>
        </div>

        <!-- Botón de Acceso Rápido a la Galería -->
        <button 
          v-if="designHistory.length > 0 && !isGenerating"
          @click.stop="openGallery(activeDesignId)"
          class="absolute top-4 left-4 bg-white/90 hover:bg-slate-100 dark:bg-slate-950/70 dark:hover:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 dark:hover:border-indigo-400/30 px-3.5 py-2 rounded-xl text-slate-700 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all duration-300 hover:scale-102 z-30 flex items-center gap-2 font-bold text-xs shadow-lg"
          title="Abrir Galería de Propuestas"
        >
          <Eye class="w-4 h-4" />
          <span>Galería ({{ designHistory.length }})</span>
        </button>

        <!-- Loading overlay — desenfoque satinado + logs de IA -->
        <div v-if="isGenerating" class="absolute inset-0 bg-slate-100/90 dark:bg-slate-950/75 backdrop-blur-xl flex flex-col items-center justify-center gap-6 z-40">
          <div class="relative w-14 h-14 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-800 border-t-indigo-500 animate-spin"></div>
            <Sparkles class="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse-subtle" />
          </div>
          <div class="glass-card px-7 py-5 rounded-2xl border border-slate-200 dark:border-white/10 text-center max-w-xs mx-4 shadow-lg dark:shadow-glow-indigo">
            <p class="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Renderizando con IA</p>
            <div class="ai-loading-bar mx-auto mb-3">
              <div class="ai-loading-bar-inner"></div>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed min-h-[2.5rem] transition-all duration-500">
              {{ generationLogs[generationStep] }}
            </p>
            <div class="flex justify-center gap-1.5 mt-3">
              <span 
                v-for="(_, i) in generationLogs" 
                :key="i"
                :class="i <= generationStep ? 'bg-indigo-600 dark:bg-indigo-400 w-4' : 'bg-slate-200 dark:bg-white/10 w-1.5'"
                class="h-1.5 rounded-full transition-all duration-300"
              ></span>
            </div>
          </div>
        </div>

        <!-- Botones Flotantes -->
        <div v-if="!isGenerating && activeDesignId !== 'original'" class="absolute bottom-4 right-4 flex gap-2.5 z-30">
          <button 
            @click.stop="downloadDesign"
            class="glass-btn-primary px-4 py-2.5 text-xs flex items-center gap-2 border border-slate-200 dark:border-white/10"
          >
            <Download class="w-3.5 h-3.5" />
            Descargar Render
          </button>
          <button 
            @click.stop="clearUploadedImage"
            class="bg-red-500/10 hover:bg-red-500/80 border border-red-500/30 hover:border-red-400/50 p-2.5 rounded-xl text-red-600 hover:text-white dark:text-red-300 dark:hover:text-white transition-all duration-300 hover:scale-102 shadow-lg backdrop-blur-sm"
            title="Empezar diseño desde cero"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
