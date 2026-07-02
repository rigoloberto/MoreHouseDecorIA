<script setup lang="ts">
import { Printer, CheckCircle, X } from 'lucide-vue-next';
import { useDesigner } from '../composables/useDesigner';

const { 
  showQuoteModal, 
  activeDesign, 
  preferences, 
  getAccumulatedProducts, 
  confirmQuote, 
  printQuote,
  designHistory
} = useDesigner();
</script>

<template>
  <!-- MODAL DE COTIZACIÓN FORMAL (FACTURA DE LUJO EN PANTALLA) -->
  <div 
    v-if="showQuoteModal && activeDesign" 
    class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 dark:bg-[#090d16]/90 backdrop-blur-xl p-4 animate-fade-in print-invoice-modal"
  >
    <div 
      class="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 w-full max-w-2xl rounded-3xl shadow-float-card flex flex-col max-h-[90vh] overflow-hidden animate-scale-up"
      @click.stop
    >
      <!-- Cabecera de la Factura -->
      <div class="invoice-header-band p-7 flex justify-between items-start">
        <div class="flex flex-col gap-1.5">
          <span class="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-[0.2em]">More House S.A.</span>
          <h2 class="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Cotización de Diseño Virtual</h2>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Inspección de Turno: {{ activeDesign.label.split(' (')[0] }}</p>
        </div>
        <div class="text-right flex flex-col gap-2 items-end">
          <span class="px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase bg-indigo-50 border border-indigo-200 text-indigo-650 dark:bg-indigo-500/10 dark:border-indigo-400/25 dark:text-indigo-300 font-mono tracking-wider">
            #MH-{{ activeDesign.id.replace('design-', '') }}
          </span>
          <p class="text-[10px] text-slate-400 dark:text-slate-500">{{ new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        </div>
      </div>

      <div class="invoice-accent-line"></div>

      <!-- Contenido Desglosado -->
      <div class="p-7 overflow-y-auto flex flex-col gap-7 scrollbar-thin">
        <!-- Datos de la Cuenta -->
        <div class="grid grid-cols-2 gap-5 text-xs bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200 dark:border-white/10">
          <div>
            <p class="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Cliente</p>
            <p class="text-slate-800 dark:text-slate-200 font-bold mt-1">Cliente Invitado</p>
          </div>
          <div>
            <p class="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Espacio / Estilo</p>
            <p class="text-slate-800 dark:text-slate-200 font-bold mt-1">{{ preferences.spaceType }} · {{ preferences.style }}</p>
          </div>
        </div>

        <!-- Tabla de Muebles -->
        <div class="flex flex-col gap-3">
          <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Concepto de Cotización</span>
          <div class="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950/30">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-100 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  <th class="p-4 pl-5">Producto</th>
                  <th class="p-4">Categoría</th>
                  <th class="p-4">Medidas</th>
                  <th class="p-4 text-right pr-5">Precio</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="item in getAccumulatedProducts(activeDesign.id)" 
                  :key="item.id"
                  class="border-b border-slate-200 dark:border-white/[0.04] last:border-0 hover:bg-slate-100/50 dark:hover:bg-white/[0.03] transition-colors duration-200 animate-fade-in"
                >
                  <td class="p-4 pl-5 flex items-center gap-3">
                    <img :src="item.details?.image" class="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-white/10" />
                    <div>
                      <p class="font-bold text-slate-800 dark:text-slate-200">{{ item.name }}</p>
                      <p class="text-[9px] text-slate-500 truncate max-w-xs mt-0.5 leading-relaxed">{{ item.justification }}</p>
                    </div>
                  </td>
                  <td class="p-4 text-slate-600 dark:text-slate-400">{{ item.details?.category }}</td>
                  <td class="p-4 text-slate-500 font-mono text-[10px]">{{ item.details?.dimensions }}</td>
                  <td class="p-4 text-right pr-5 font-bold text-indigo-600 dark:text-indigo-300">${{ item.details?.price || 0 }} USD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totalizadores -->
        <div class="flex flex-col items-end gap-2 self-end w-full max-w-xs pt-5 border-t border-slate-200 dark:border-white/10">
          <div class="flex justify-between w-full text-xs text-slate-500">
            <span>Subtotal</span>
            <span class="font-semibold text-slate-700 dark:text-slate-300">${{ getAccumulatedProducts(activeDesign.id).reduce((acc, p) => acc + (p.details?.price || 0), 0) }} USD</span>
          </div>
          <div class="flex justify-between w-full text-xs text-slate-500">
            <span>Impuestos (IVA 0%)</span>
            <span class="font-semibold text-slate-700 dark:text-slate-300">$0.00 USD</span>
          </div>
          <div class="invoice-accent-line my-2"></div>
          <div class="flex justify-between w-full text-sm font-bold">
            <span class="text-slate-600 dark:text-slate-300">Total Cotizado</span>
            <span class="text-xl font-extrabold text-indigo-600 dark:text-transparent dark:bg-gradient-to-r dark:from-indigo-300 dark:to-violet-300 dark:bg-clip-text">${{ getAccumulatedProducts(activeDesign.id).reduce((acc, p) => acc + (p.details?.price || 0), 0) }} USD</span>
          </div>
        </div>
      </div>

      <!-- Botones de Acción de Factura -->
      <div class="p-6 border-t border-slate-200 dark:border-white/10 flex justify-between gap-3 bg-slate-50 dark:bg-slate-950/30">
        <button 
          type="button" 
          @click="printQuote" 
          class="glass-btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <Printer class="w-4 h-4" />
          <span>Imprimir / Guardar PDF</span>
        </button>
        <div class="flex gap-3">
          <button 
            type="button" 
            @click="showQuoteModal = false" 
            class="glass-btn-secondary py-2.5 px-5 text-xs font-bold"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            @click="confirmQuote" 
            class="glass-btn-primary py-2.5 px-5 text-xs flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle class="w-4 h-4" />
            <span>Confirmar Cotización</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- SECCIÓN SOLO PARA IMPRESIÓN: RENDERIZA UNA FACTURA CUMULATIVA POR CADA ETAPA -->
  <div class="hidden print:block print-pages-container">
    <div 
      v-for="(design, idx) in designHistory.slice(1)" 
      :key="design.id" 
      class="print-page border-0 bg-white text-slate-900 w-full max-w-4xl mx-auto flex flex-col gap-8"
    >
      <!-- Cabecera de la Factura -->
      <div class="flex justify-between items-start border-b-2 border-slate-200 pb-6">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-indigo-700 uppercase tracking-[0.25em]">More House S.A.</span>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">Cotización de Diseño Virtual</h2>
          <p class="text-[10px] text-slate-500 mt-1">Etapa {{ idx + 1 }}: {{ design.label.split(' (')[0] }}</p>
        </div>
        <div class="text-right flex flex-col gap-1.5">
          <span class="px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase bg-slate-100 border border-slate-200 text-slate-700 font-mono tracking-wider">
            #MH-{{ design.id.replace('design-', '') }}
          </span>
          <p class="text-[9px] text-slate-500">{{ new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        </div>
      </div>

      <!-- Datos del Proyecto -->
      <div class="grid grid-cols-2 gap-6 text-[10px] bg-slate-50 p-5 rounded-xl border border-slate-100">
        <div>
          <p class="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Cliente</p>
          <p class="text-slate-900 font-bold mt-1">Cliente Invitado</p>
        </div>
        <div>
          <p class="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Espacio / Estilo</p>
          <p class="text-slate-900 font-bold mt-1">{{ preferences.spaceType }} · {{ preferences.style }}</p>
        </div>
      </div>

      <!-- Tabla de Muebles Acumulados -->
      <div class="flex flex-col gap-3">
        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Concepto de Cotización</span>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <table class="w-full text-left text-[10px] border-collapse" style="table-layout: fixed;">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[8px] tracking-wider">
                <th class="p-3 pl-4 w-[45%]">Producto</th>
                <th class="p-3 w-[15%]">Categoría</th>
                <th class="p-3 w-[25%]">Medidas</th>
                <th class="p-3 text-right pr-4 w-[15%]">Precio</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="item in getAccumulatedProducts(design.id)" 
                :key="item.id"
                class="border-b border-slate-100 last:border-0"
              >
                <td class="p-3 pl-4 text-slate-800">
                  <div class="flex items-center gap-3">
                    <img :src="item.details?.image" class="w-9 h-9 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                    <div>
                      <p class="font-bold text-slate-900">{{ item.name }}</p>
                      <p class="text-[8px] text-slate-500 max-w-sm leading-tight mt-0.5">{{ item.justification }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-3 text-slate-700">{{ item.details?.category }}</td>
                <td class="p-3 text-slate-600 font-mono text-[9px]">{{ item.details?.dimensions }}</td>
                <td class="p-3 text-right pr-4 font-bold text-slate-900">${{ item.details?.price || 0 }} USD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totalizadores -->
      <div class="flex flex-col items-end gap-2 self-end w-full max-w-xs pt-4 border-t-2 border-slate-200">
        <div class="flex justify-between w-full text-[10px] text-slate-500">
          <span>Subtotal</span>
          <span class="font-semibold text-slate-700">${{ getAccumulatedProducts(design.id).reduce((acc, p) => acc + (p.details?.price || 0), 0) }} USD</span>
        </div>
        <div class="flex justify-between w-full text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
          <span>Total Cotizado</span>
          <span class="text-indigo-700 font-extrabold">${{ getAccumulatedProducts(design.id).reduce((acc, p) => acc + (p.details?.price || 0), 0) }} USD</span>
        </div>
      </div>
    </div>
  </div>
</template>
