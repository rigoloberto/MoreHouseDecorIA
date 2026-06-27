<script setup lang="ts">
import { Settings, Eye, RefreshCw, Sparkles } from 'lucide-vue-next';
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
</script>

<template>
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
            :class="[
              isProductAlreadyPlaced(prod.id) ? 'opacity-50 cursor-default' : 'hover:bg-white/10 cursor-pointer',
              selectedProductIds.includes(prod.id) ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/5'
            ]"
            class="flex items-center justify-between p-2.5 rounded-xl border transition-colors select-none"
          >
            <div class="flex items-center gap-3 min-w-0 flex-grow">
              <div class="relative group/thumb cursor-zoom-in flex-shrink-0 animate-pulse-subtle" @click.stop="openProductPreview(prod)" title="Ver Ficha Técnica">
                <img :src="prod.image" class="w-9 h-9 object-cover rounded-lg border border-white/10 transition-transform group-hover/thumb:scale-105" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <Eye class="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div class="min-w-0 flex-grow" @click="!isProductAlreadyPlaced(prod.id) && toggleProductSelection(prod.id)">
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
        <div class="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5">
          <button 
            type="button"
            @click="preferences.priority = 'sketch'"
            :class="preferences.priority === 'sketch' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow' : 'text-slate-400 border-transparent hover:text-slate-200'"
            class="py-2 px-0.5 rounded-lg text-[9px] font-bold border flex items-center justify-center gap-0.5 transition-all duration-200"
          >
            <span>📝 Boceto (4B)</span>
          </button>
          <button 
            type="button"
            @click="preferences.priority = 'speed'"
            :class="preferences.priority === 'speed' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow' : 'text-slate-400 border-transparent hover:text-slate-200'"
            class="py-2 px-0.5 rounded-lg text-[9px] font-bold border flex items-center justify-center gap-0.5 transition-all duration-200"
          >
            <span>⚡ Rapidez (9B)</span>
          </button>
          <button 
            type="button"
            @click="preferences.priority = 'quality'"
            :class="preferences.priority === 'quality' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow' : 'text-slate-400 border-transparent hover:text-slate-200'"
            class="py-2 px-0.5 rounded-lg text-[9px] font-bold border flex items-center justify-center gap-0.5 transition-all duration-200"
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
</template>
