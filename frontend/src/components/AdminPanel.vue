<script setup lang="ts">
import { 
  Settings, ShieldAlert, LogOut, Plus, Eye, Edit3, Trash2, Upload, Maximize2, X, TrendingUp 
} from 'lucide-vue-next';
import { useDesigner } from '../composables/useDesigner';

const { 
  activeTab, 
  isAdminLoggedIn, 
  adminCredentials, 
  loginError, 
  handleAdminLogin, 
  handleAdminLogout, 
  stats, 
  realStats, 
  products, 
  openAddModal, 
  expandedProductImageUrl, 
  openProductPreview, 
  editProduct, 
  deleteProduct, 
  showAddModal, 
  editingProduct, 
  productForm, 
  saveProduct, 
  triggerAdminFileInput, 
  handleAdminFileChange, 
  adminFileInput 
} = useDesigner();
</script>

<template>
  <section v-if="activeTab === 'admin'" class="flex-grow flex flex-col gap-10 animate-slide-up">
    
    <!-- ESTADO: NO LOGUEADO -->
    <div v-if="!isAdminLoggedIn" class="max-w-md w-full mx-auto my-16 glass-card p-8 md:p-10 rounded-3xl flex flex-col gap-8 shadow-float-card border border-slate-200 dark:border-white/10">
      <div class="text-center flex flex-col items-center gap-3">
        <div class="w-14 h-14 bg-gradient-to-br from-indigo-500/10 to-violet-600/5 dark:from-indigo-500/20 dark:to-violet-600/10 border border-indigo-200 dark:border-indigo-400/25 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-glow-indigo">
          <Settings class="w-6 h-6" />
        </div>
        <h2 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Acceso Administrativo</h2>
        <p class="text-slate-500 dark:text-slate-400/90 text-xs leading-relaxed max-w-xs">Ingresa tus credenciales seguras para administrar el sistema.</p>
      </div>

      <form @submit.prevent="handleAdminLogin" class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuario</label>
          <input v-model="adminCredentials.username" type="text" class="glass-input" required placeholder="Usuario" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contraseña</label>
          <input v-model="adminCredentials.password" type="password" class="glass-input" required placeholder="Contraseña" />
        </div>

        <div v-if="loginError" class="bg-red-500/10 border border-red-500/25 text-red-650 dark:text-red-200 text-xs p-4 rounded-2xl flex items-center gap-2.5">
          <ShieldAlert class="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
          <span>{{ loginError }}</span>
        </div>

        <button type="submit" class="glass-btn-primary w-full mt-1 py-3.5">Iniciar Sesión</button>
      </form>
    </div>

    <!-- ESTADO: LOGUEADO -->
    <div v-else class="flex flex-col gap-10">
      
      <!-- CABECERA ADMIN -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-slate-200 dark:border-white/10 pb-8">
        <div>
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Panel Administrativo</h2>
          <p class="text-slate-500 dark:text-slate-400/90 text-sm mt-2">Administra el inventario oficial e inspecciona las métricas de uso.</p>
        </div>
        
        <button @click="handleAdminLogout" class="bg-red-500/10 border border-red-500/25 hover:bg-red-500/80 text-red-600 dark:text-red-300 hover:text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 hover:scale-102">
          <LogOut class="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>

      <!-- TARJETAS DE MÉTRICAS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="stat in stats" 
          :key="stat.name" 
          class="glass-card p-7 rounded-3xl flex items-center justify-between border border-slate-200 dark:border-white/10 hover:border-indigo-500/25 transition-all duration-300"
        >
          <div class="flex flex-col gap-1.5">
            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ stat.name }}</span>
            <span class="text-3xl font-extrabold text-slate-800 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-slate-300 dark:bg-clip-text">{{ stat.value }}</span>
          </div>
          <div :class="stat.color" class="stat-icon-badge">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
        </div>
      </div>

      <!-- GRÁFICA DE ESTILOS MÁS SOLICITADOS -->
      <div class="glass-card p-7 md:p-9 rounded-3xl flex flex-col gap-6">
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <div class="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-400/20">
            <TrendingUp class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          Estilos más Solicitados
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div 
            v-for="(count, style) in realStats.styleStats" 
            :key="style" 
            class="bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 p-5 rounded-2xl flex flex-col gap-3 hover:border-indigo-500/20 dark:hover:border-indigo-500/25 transition-colors duration-300"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ style }}</span>
              <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-400/20">
                {{ count }}
              </span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-950/60 rounded-full h-1.5 overflow-hidden border border-slate-300/40 dark:border-white/5">
              <div 
                class="bg-gradient-to-r from-indigo-600 to-violet-600 h-full rounded-full transition-all duration-700 ease-out" 
                :style="{ width: `${realStats.totalGenerations > 0 ? (count / realStats.totalGenerations) * 100 : 0}%` }"
              ></div>
            </div>
            <span class="text-[10px] text-slate-400 dark:text-slate-500">
              {{ realStats.totalGenerations > 0 ? Math.round((count / realStats.totalGenerations) * 100) : 0 }}% de peticiones
            </span>
          </div>
        </div>
      </div>

      <!-- CRUD DEL INVENTARIO -->
      <div class="glass-card p-7 md:p-9 rounded-3xl flex flex-col gap-7">
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Catálogo Oficial de Muebles</h3>
          <button @click="openAddModal" class="glass-btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
            <Plus class="w-4 h-4" />
            Agregar Producto
          </button>
        </div>

        <!-- TABLA CRUD -->
        <div class="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-2xl">
          <table class="w-full border-collapse text-left text-sm text-slate-650 dark:text-slate-300">
            <thead class="bg-slate-100 dark:bg-slate-950/60 border-b border-slate-200 dark:border-white/10 font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th class="py-4 px-6 text-[11px] uppercase tracking-wider">Imagen</th>
                <th class="py-4 px-6 text-[11px] uppercase tracking-wider">Nombre</th>
                <th class="py-4 px-6 text-[11px] uppercase tracking-wider">Categoría</th>
                <th class="py-4 px-6 text-[11px] uppercase tracking-wider">Estilo</th>
                <th class="py-4 px-6 text-[11px] uppercase tracking-wider text-right">Precio</th>
                <th class="py-4 px-6 text-[11px] uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in products" :key="prod.id" class="border-b border-slate-150 dark:border-b dark:border-white/[0.04] hover:bg-slate-100/50 dark:hover:bg-white/[0.03] transition-colors duration-200">
                <td class="py-5 px-6">
                  <div 
                    @click="expandedProductImageUrl = prod.image"
                    class="relative group/admin-thumb cursor-zoom-in w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-indigo-500/35 dark:hover:border-indigo-400/30 transition-colors"
                    title="Ampliar Imagen"
                  >
                    <img :src="prod.image" :alt="prod.name" class="w-full h-full object-cover transition-transform duration-300 group-hover/admin-thumb:scale-110" />
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/admin-thumb:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                      <Eye class="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </td>
                <td class="py-5 px-6 font-bold text-slate-800 dark:text-slate-100">{{ prod.name }}</td>
                <td class="py-5 px-6 text-slate-500 dark:text-slate-400">{{ prod.category }}</td>
                <td class="py-5 px-6">
                  <span class="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                    {{ prod.style }}
                  </span>
                </td>
                <td class="py-5 px-6 text-right font-bold text-indigo-600 dark:text-indigo-300">${{ prod.price }}</td>
                <td class="py-5 px-6 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openProductPreview(prod)" class="p-2.5 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 rounded-xl transition-all duration-200" title="Ver Detalle">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button @click="editProduct(prod)" class="p-2.5 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 rounded-xl transition-all duration-200" title="Editar">
                      <Edit3 class="w-4 h-4" />
                    </button>
                    <button @click="deleteProduct(prod.id)" class="p-2.5 hover:bg-red-500/10 dark:hover:bg-red-500/15 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 rounded-xl transition-all duration-200" title="Eliminar">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="products.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-500">No hay productos cargados en el catálogo.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- MODAL AGREGAR / EDITAR PRODUCTO -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-[#090d16]/85 backdrop-blur-xl p-4 animate-fade-in">
      <div class="glass-card max-w-lg w-full p-7 md:p-9 rounded-3xl flex flex-col gap-7 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10 shadow-float-card animate-scale-up">
        <h3 class="text-xl font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-white/10 pb-5">
          {{ editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto' }}
        </h3>

        <form @submit.prevent="saveProduct" class="flex flex-col gap-5">
          <!-- Nombre -->
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre del Producto</label>
            <input v-model="productForm.name" type="text" class="glass-input" required placeholder="Ej. Poltrona Mónaco" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Categoría -->
            <div class="flex flex-col gap-2">
              <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoría</label>
              <select v-model="productForm.category" class="glass-input">
                <option>Sala</option>
                <option>Comedor</option>
                <option>Oficina</option>
              </select>
            </div>
            <!-- Estilo -->
            <div class="flex flex-col gap-2">
              <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estilo</label>
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
            <div class="flex flex-col gap-2">
              <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio ($ USD)</label>
              <input v-model="productForm.price" type="number" step="any" class="glass-input" required min="0" placeholder="0" />
            </div>
            <!-- Dimensiones -->
            <div class="flex flex-col gap-2">
              <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Medidas</label>
              <input v-model="productForm.dimensions" type="text" class="glass-input" required placeholder="Ej. 180x80x75 cm" />
            </div>
          </div>

          <!-- URL Imagen / Subida de Archivo -->
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Imagen del Producto</label>
            <div class="flex gap-2">
              <input v-model="productForm.image" type="text" class="glass-input flex-grow" placeholder="https://images.unsplash.com/..." />
              <button 
                type="button" 
                @click="triggerAdminFileInput" 
                class="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/25 border border-indigo-200 dark:border-indigo-400/25 rounded-xl text-indigo-650 dark:text-indigo-300 text-xs font-bold transition-all duration-300 flex items-center gap-1.5 hover:scale-102"
              >
                <Upload class="w-3.5 h-3.5" />
                <span>Subir</span>
              </button>
            </div>
            <input 
              type="file" 
              ref="adminFileInput" 
              class="hidden" 
              accept="image/*" 
              @change="handleAdminFileChange"
            />

            <!-- Vista Previa de la Imagen del Producto -->
            <div v-if="productForm.image" class="mt-2 flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl relative group max-w-full">
              <div class="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-250 dark:border-white/10 flex-shrink-0 cursor-pointer" @click="expandedProductImageUrl = productForm.image">
                <img :src="productForm.image" class="w-full h-full object-cover transition-transform duration-300 hover:scale-110" alt="Vista previa" />
                <div class="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 class="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div class="flex-grow min-w-0 pr-10">
                <p class="text-[11px] text-slate-500 dark:text-slate-300 truncate font-mono">{{ productForm.image }}</p>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                  <span>Imagen Enlazada</span>
                </span>
              </div>
              <button 
                type="button" 
                @click="productForm.image = ''" 
                class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-500/10 hover:bg-red-500/20 dark:bg-red-500/10 dark:hover:bg-red-500/25 text-red-650 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20"
                title="Eliminar imagen"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Descripción -->
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descripción</label>
            <textarea v-model="productForm.description" class="glass-input h-24 resize-none" placeholder="Breve descripción del producto..."></textarea>
          </div>

          <!-- Botones de Acción -->
          <div class="flex justify-end gap-3 mt-1 pt-5 border-t border-slate-200 dark:border-white/10">
            <button type="button" @click="showAddModal = false" class="glass-btn-secondary py-2.5 text-sm px-5">Cancelar</button>
            <button type="submit" class="glass-btn-primary py-2.5 text-sm px-5">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>

  </section>
</template>
