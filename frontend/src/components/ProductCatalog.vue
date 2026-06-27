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
          <span class="absolute top-4 right-4 bg-[#090d16]/80 backdrop-blur-md border border-white/10 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full z-10">
            {{ prod.category }}
          </span>
          <!-- Hover overlay with Zoom/Expand button -->
          <div class="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button 
              @click="openProductPreview(prod)"
              class="bg-slate-950/90 hover:bg-indigo-600 border border-white/10 p-3 rounded-2xl text-indigo-300 hover:text-white shadow-xl flex items-center gap-1.5 transition-all duration-300 transform scale-90 group-hover:scale-100 font-semibold text-xs"
            >
              <Eye class="w-4 h-4" />
              <span>Ver Ficha Técnica</span>
            </button>
          </div>
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
</template>
