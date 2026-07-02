<script setup lang="ts">
import { ref } from 'vue';
import { Settings, Eye, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-vue-next';
import { useDesigner } from '../composables/useDesigner';

const { 
  preferences, 
  selectedProductIds, 
  products, 
  isProductAlreadyPlaced, 
  toggleProductSelection, 
  openProductPreview, 
  fetchCatalog, 
  generateDesign, 
  isGenerating 
} = useDesigner();

const isCollapsed = ref(false);
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="glass-card p-7 rounded-3xl flex flex-col gap-6 shadow-glass-light dark:shadow-glass-dark">
      <!-- Cabecera colapsable interactiva -->
      <div 
        @click="isCollapsed = !isCollapsed" 
        class="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 text-slate-800 dark:text-slate-100 cursor-pointer select-none group/header"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-400/20 group-hover/header:border-indigo-500/50 transition-all duration-300">
            <Settings class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 class="text-lg font-bold tracking-tight">Especificaciones</h2>
        </div>
        <button 
          type="button"
          class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5 transition-all duration-300"
        >
          <ChevronDown v-if="isCollapsed" class="w-4 h-4" />
          <ChevronUp v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- Resumen colapsado (Badge Chips) -->
      <div v-show="isCollapsed" class="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400 animate-fade-in">
        <span class="px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 font-bold flex items-center gap-1">
          🏠 {{ preferences.spaceType }}
        </span>
        <span class="px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 font-bold flex items-center gap-1">
          🎨 {{ preferences.style }}
        </span>
        <span class="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/40 dark:border-indigo-400/10 text-indigo-650 dark:text-indigo-300 font-extrabold flex items-center gap-1">
          📦 Muebles: {{ selectedProductIds.length }}/3
        </span>
        <span class="px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 font-bold uppercase text-[9px] tracking-wider">
          ⚙️ {{ preferences.priority === 'sketch' ? 'Boceto' : preferences.priority === 'speed' ? 'Rapidez' : 'Calidad' }}
        </span>
        <p class="text-[10px] text-slate-400 dark:text-slate-500 italic w-full mt-2 pl-1 select-none">Panel minimizado. Haz clic en el encabezado para expandir.</p>
      </div>

      <!-- Formulario completo de preferencias -->
      <div v-show="!isCollapsed" class="flex flex-col gap-6 animate-slide-up">
        <!-- Tipo de espacio -->
        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo de espacio</label>
          <select v-model="preferences.spaceType" class="glass-input py-2.5 text-sm w-full">
            <option>Sala</option>
            <option>Comedor</option>
            <option>Oficina / Estudio</option>
            <option>Cocina</option>
            <option>Dormitorio</option>
          </select>
        </div>

        <!-- Estilo estético -->
        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estilo estético</label>
          <select v-model="preferences.style" class="glass-input py-2.5 text-sm w-full">
            <option>Minimalista</option>
            <option>Moderno</option>
            <option>Elegante</option>
            <option>Lujo</option>
            <option>Industrial</option>
          </select>
        </div>

        <!-- Colores -->
        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paleta de colores</label>
          <input v-model="preferences.colors" type="text" class="glass-input py-2.5 text-sm w-full" placeholder="Gris suave, madera y beige" />
        </div>

        <!-- Iluminación -->
        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Iluminación</label>
          <input v-model="preferences.lighting" type="text" class="glass-input py-2.5 text-sm w-full" placeholder="Luz natural y lámparas cálidas" />
        </div>

        <!-- Instrucciones adicionales (Texto Libre) -->
        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">¿Qué deseas agregar? (Texto libre)</label>
          <textarea 
            v-model="preferences.customText" 
            class="glass-input py-3 h-20 text-xs w-full resize-none leading-relaxed" 
            placeholder="Ej: pon cortinas blancas de tela, papel tapiz de textura de madera de roble..."
          ></textarea>
        </div>

        <!-- Checklist de Catálogo a colocar -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Muebles de Catálogo a colocar</label>
            <span class="text-[10px] text-indigo-650 dark:text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 dark:border-indigo-400/20 px-2.5 py-1 rounded-full">
              Turno: {{ selectedProductIds.length }}/3
            </span>
          </div>
          <div class="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 max-h-52 overflow-y-auto flex flex-col gap-2 scrollbar-thin">
            <div 
              v-for="prod in products" 
              :key="prod.id"
              :class="[
                isProductAlreadyPlaced(prod.id) ? 'opacity-45 cursor-default' : 'hover:bg-slate-200/50 dark:hover:bg-white/[0.06] cursor-pointer',
                selectedProductIds.includes(prod.id) ? 'border-indigo-400/50 bg-indigo-500/10 dark:bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.1)]' : 'border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]'
              ]"
              class="flex items-center justify-between p-3 rounded-xl border transition-all duration-300 select-none"
            >
              <div class="flex items-center gap-3 min-w-0 flex-grow">
                <div class="relative group/thumb cursor-zoom-in flex-shrink-0" @click.stop="openProductPreview(prod)" title="Ver Ficha Técnica">
                  <img :src="prod.image" class="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-white/10 transition-transform duration-300 group-hover/thumb:scale-105" />
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                    <Eye class="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div class="min-w-0 flex-grow" @click="!isProductAlreadyPlaced(prod.id) && toggleProductSelection(prod.id)">
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{{ prod.name }}</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">${{ prod.price }} USD · {{ prod.style }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="isProductAlreadyPlaced(prod.id)" class="text-[9px] font-bold text-indigo-650 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-400/25 px-2 py-0.5 rounded-lg">
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
                  class="rounded accent-indigo-600 dark:accent-indigo-500 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-white/20 cursor-pointer w-4 h-4 disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div v-if="products.length === 0" class="text-center py-8 text-xs text-slate-500 flex flex-col items-center gap-3">
              <span>No se cargó el catálogo.</span>
              <button 
                @click="fetchCatalog" 
                class="px-3 py-1.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-400/25 text-[10px] font-bold flex items-center gap-1.5 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-all duration-300 hover:scale-102"
              >
                <RefreshCw class="w-3 h-3" /> Reintentar
              </button>
            </div>
          </div>
        </div>

        <!-- Prioridad Calidad / Velocidad — Segment Control -->
        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prioridad del Renderizado</label>
          <div class="segment-control">
            <button 
              type="button"
              @click="preferences.priority = 'sketch'"
              :class="preferences.priority === 'sketch' ? 'segment-option-active' : 'segment-option'"
              class="segment-option flex items-center justify-center rounded-xl"
            >
              <span>📝 Boceto</span>
            </button>
            <button 
              type="button"
              @click="preferences.priority = 'speed'"
              :class="preferences.priority === 'speed' ? 'segment-option-active' : 'segment-option'"
              class="segment-option flex items-center justify-center rounded-xl"
            >
              <span>⚡ Rapidez</span>
            </button>
            <button 
              type="button"
              @click="preferences.priority = 'quality'"
              :class="preferences.priority === 'quality' ? 'segment-option-active' : 'segment-option'"
              class="segment-option flex items-center justify-center rounded-xl"
            >
              <span>🎨 Calidad</span>
            </button>
          </div>
        </div>

        <!-- BOTÓN DE GENERACIÓN -->
        <button 
          @click="generateDesign"
          :disabled="isGenerating"
          class="glass-btn-primary w-full flex items-center justify-center gap-2.5 mt-1 py-3.5 text-sm"
        >
          <Sparkles class="w-4 h-4" />
          <span>{{ isGenerating ? 'Procesando Turno...' : 'Generar Turno de Diseño' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
