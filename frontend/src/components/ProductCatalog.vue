<script setup lang="ts">
import { RefreshCw, Eye } from 'lucide-vue-next';
import { useDesigner } from '../composables/useDesigner';

const { 
  activeTab, 
  selectedCategory, 
  selectedStyle, 
  catalogLoading, 
  products, 
  fetchCatalog, 
  filteredProducts, 
  openProductPreview 
} = useDesigner();
</script>

<template>
  <section v-if="activeTab === 'catalog'" class="flex-grow flex flex-col gap-10 animate-slide-up">
    
    <!-- ENCABEZADO Y FILTROS -->
    <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-slate-200 dark:border-white/10 pb-8">
      <div>
        <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Catálogo More House</h2>
        <p class="text-slate-500 dark:text-slate-400/90 text-sm mt-2 leading-relaxed">Explora nuestras colecciones exclusivas de muebles y decoración.</p>
      </div>

      <div class="flex flex-wrap gap-5 w-full md:w-auto">
        <!-- Categoría -->
        <div class="flex flex-col gap-2 flex-grow md:flex-grow-0 min-w-[140px]">
          <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Categoría</label>
          <select v-model="selectedCategory" class="glass-input py-2.5 text-sm">
            <option>Todos</option>
            <option>Sala</option>
            <option>Comedor</option>
            <option>Oficina</option>
          </select>
        </div>
        <!-- Estilo -->
        <div class="flex flex-col gap-2 flex-grow md:flex-grow-0 min-w-[140px]">
          <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estilo</label>
          <select v-model="selectedStyle" class="glass-input py-2.5 text-sm">
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
    <div v-if="catalogLoading" class="text-center py-24 flex flex-col items-center gap-4">
      <div class="relative">
        <RefreshCw class="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <div class="absolute inset-0 blur-xl bg-indigo-500/20 rounded-full"></div>
      </div>
      <span class="text-slate-500 dark:text-slate-400 text-sm">Cargando catálogo oficial...</span>
    </div>
    <div v-else-if="products.length === 0" class="text-center py-24 flex flex-col items-center gap-4 glass-card rounded-3xl max-w-md mx-auto p-10">
      <span class="text-slate-500 dark:text-slate-400 text-sm">No se pudo conectar al servidor para obtener el catálogo.</span>
      <button 
        @click="fetchCatalog" 
        class="glass-btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
      >
        <RefreshCw class="w-4 h-4" /> Intentar Cargar Catálogo
      </button>
    </div>

    <!-- GRILLA DE PRODUCTOS -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
      <div 
        v-for="prod in filteredProducts" 
        :key="prod.id" 
        class="glass-card glass-card-hover overflow-hidden rounded-3xl flex flex-col justify-between group hover:-translate-y-2 hover:shadow-float-card transition-all duration-500 ease-out"
      >
        <div class="relative overflow-hidden h-[200px]">
          <img 
            :src="prod.image" 
            :alt="prod.name" 
            class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span class="absolute top-4 right-4 bg-white/95 dark:bg-slate-950/70 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full z-10">
            {{ prod.category }}
          </span>
          <!-- Hover overlay with Zoom/Expand button -->
          <div class="absolute inset-0 bg-white/30 dark:bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center backdrop-blur-[2px]">
            <button 
              @click="openProductPreview(prod)"
              class="bg-white/95 dark:bg-slate-950/90 hover:bg-indigo-600/90 dark:hover:bg-indigo-600/90 border border-slate-200 dark:border-white/10 hover:border-indigo-400/40 p-3.5 rounded-2xl text-indigo-600 dark:text-indigo-300 hover:text-white shadow-lg dark:shadow-glow-indigo flex items-center gap-2 transition-all duration-300 transform scale-90 group-hover:scale-100 font-bold text-xs hover:scale-102"
            >
              <Eye class="w-4 h-4" />
              <span>Ver Ficha Técnica</span>
            </button>
          </div>
        </div>

        <div class="p-6 flex flex-col gap-4 flex-grow justify-between">
          <div class="flex flex-col gap-2">
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-bold text-slate-850 dark:text-slate-100 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-300 leading-snug">{{ prod.name }}</h3>
              <span class="font-extrabold text-indigo-600 dark:text-indigo-300 text-base flex-shrink-0">${{ prod.price }}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400/90 line-clamp-2 leading-relaxed">{{ prod.description }}</p>
          </div>

          <div class="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            <span>📏 {{ prod.dimensions }}</span>
            <span>🏷️ {{ prod.style }}</span>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>
