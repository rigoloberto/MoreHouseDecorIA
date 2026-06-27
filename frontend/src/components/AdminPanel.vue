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
  <section v-if="activeTab === 'admin'" class="flex-grow flex flex-col gap-8 animate-slide-up">
    
    <!-- ESTADO: NO LOGUEADO -->
    <div v-if="!isAdminLoggedIn" class="max-w-md w-full mx-auto my-12 glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-6">
      <div class="text-center flex flex-col items-center gap-2">
        <div class="w-12 h-12 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shadow-inner">
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

      <!-- GRÁFICA DE ESTILOS MÁS SOLICITADOS -->
      <div class="glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-4">
        <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
          <TrendingUp class="w-5 h-5 text-indigo-400" />
          Estilos más Solicitados (Preferencia de Clientes)
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
          <div 
            v-for="(count, style) in realStats.styleStats" 
            :key="style" 
            class="bg-brand-card/30 border border-white/5 p-4 rounded-2xl flex flex-col gap-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-slate-200">{{ style }}</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-brand-500/10">
                {{ count }}
              </span>
            </div>
            <div class="w-full bg-slate-950/60 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                class="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                :style="{ width: `${realStats.totalGenerations > 0 ? (count / realStats.totalGenerations) * 100 : 0}%` }"
              ></div>
            </div>
            <span class="text-[10px] text-slate-500">
              {{ realStats.totalGenerations > 0 ? Math.round((count / realStats.totalGenerations) * 100) : 0 }}% de peticiones
            </span>
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
                  <div 
                    @click="expandedProductImageUrl = prod.image"
                    class="relative group/admin-thumb cursor-zoom-in w-10 h-10 rounded-lg overflow-hidden border border-white/10"
                    title="Ampliar Imagen"
                  >
                    <img :src="prod.image" :alt="prod.name" class="w-full h-full object-cover transition-transform group-hover/admin-thumb:scale-105" />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/admin-thumb:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye class="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
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
                    <button @click="openProductPreview(prod)" class="p-2 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg transition-all" title="Ver Detalle">
                      <Eye class="w-4 h-4" />
                    </button>
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
              <input v-model="productForm.price" type="number" step="any" class="glass-input" required min="0" placeholder="0" />
            </div>
            <!-- Dimensiones -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400">Medidas / Dimensiones</label>
              <input v-model="productForm.dimensions" type="text" class="glass-input" required placeholder="Ej. 180x80x75 cm" />
            </div>
          </div>

          <!-- URL Imagen / Subida de Archivo -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400">Imagen del Producto (URL o subir archivo)</label>
            <div class="flex gap-2">
              <input v-model="productForm.image" type="text" class="glass-input flex-grow" placeholder="https://images.unsplash.com/..." />
              <button 
                type="button" 
                @click="triggerAdminFileInput" 
                class="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 rounded-xl text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5"
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
            <div v-if="productForm.image" class="mt-2 flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-xl relative group max-w-full">
              <div class="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 cursor-pointer" @click="expandedProductImageUrl = productForm.image">
                <img :src="productForm.image" class="w-full h-full object-cover transition-transform duration-300 hover:scale-110" alt="Vista previa" />
                <div class="absolute inset-0 bg-black/45 opacity-0 group-hover/visor:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 class="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div class="flex-grow min-w-0 pr-10">
                <p class="text-[11px] text-slate-300 truncate font-mono">{{ productForm.image }}</p>
                <span class="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Imagen Enlazada</span>
                </span>
              </div>
              <button 
                type="button" 
                @click="productForm.image = ''" 
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-lg transition-colors border border-red-500/20"
                title="Eliminar imagen"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
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

  </section>
</template>
