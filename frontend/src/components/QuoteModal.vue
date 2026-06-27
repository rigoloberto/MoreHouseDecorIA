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
      class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in print-invoice-modal"
    >
      <div 
        class="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        @click.stop
      >
        <!-- Cabecera de la Factura -->
        <div class="p-6 border-b border-white/5 flex justify-between items-start bg-indigo-950/15">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest">More House S.A.</span>
            <h2 class="text-xl font-black text-slate-100">Cotización de Diseño Virtual</h2>
            <p class="text-[10px] text-slate-400 mt-1">Inspección de Turno: {{ activeDesign.label.split(' (')[0] }}</p>
          </div>
          <div class="text-right flex flex-col gap-1">
            <span class="px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-white/5 border border-white/10 text-indigo-300 font-mono">
              #MH-{{ activeDesign.id.replace('design-', '') }}
            </span>
            <p class="text-[10px] text-slate-400">Fecha: {{ new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
        </div>

        <!-- Contenido Desglosado -->
        <div class="p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin">
          <!-- Datos de la Cuenta -->
          <div class="grid grid-cols-2 gap-4 text-xs bg-white/5 p-4 rounded-2xl border border-white/5">
            <div>
              <p class="text-slate-400 font-semibold">Cliente:</p>
              <p class="text-slate-200 font-bold mt-0.5">Cliente Invitado</p>
            </div>
            <div>
              <p class="text-slate-400 font-semibold">Espacio / Estilo:</p>
              <p class="text-slate-200 font-bold mt-0.5">{{ preferences.spaceType }} ({{ preferences.style }})</p>
            </div>
          </div>

          <!-- Tabla de Muebles -->
          <div class="flex flex-col gap-2">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Concepto de Cotización</span>
            <div class="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/40">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-white/5 border-b border-white/5 text-slate-400 font-semibold text-[10px] uppercase">
                    <th class="p-3 pl-4">Producto</th>
                    <th class="p-3">Categoría</th>
                    <th class="p-3">Medidas</th>
                    <th class="p-3 text-right pr-4">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="item in getAccumulatedProducts(activeDesign.id)" 
                    :key="item.id"
                    class="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors animate-fade-in"
                  >
                    <td class="p-3 pl-4 flex items-center gap-3">
                      <img :src="item.details?.image" class="w-9 h-9 object-cover rounded border border-white/10" />
                      <div>
                        <p class="font-bold text-slate-200">{{ item.name }}</p>
                        <p class="text-[9px] text-slate-400 truncate max-w-xs">{{ item.justification }}</p>
                      </div>
                    </td>
                    <td class="p-3 text-slate-300">{{ item.details?.category }}</td>
                    <td class="p-3 text-slate-400 font-mono text-[10px]">{{ item.details?.dimensions }}</td>
                    <td class="p-3 text-right pr-4 font-bold text-slate-200">${{ item.details?.price || 0 }} USD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totalizadores -->
          <div class="flex flex-col items-end gap-1.5 self-end w-full max-w-xs pt-4 border-t border-white/5">
            <div class="flex justify-between w-full text-xs text-slate-400">
              <span>Subtotal:</span>
              <span class="font-semibold text-slate-300">${{ getAccumulatedProducts(activeDesign.id).reduce((acc, p) => acc + (p.details?.price || 0), 0) }} USD</span>
            </div>
            <div class="flex justify-between w-full text-xs text-slate-400">
              <span>Impuestos (IVA 0% - Promoción):</span>
              <span class="font-semibold text-slate-300">$0.00 USD</span>
            </div>
            <div class="flex justify-between w-full text-sm text-slate-200 font-bold mt-1.5 pt-2 border-t border-white/5">
              <span>Total Cotizado:</span>
              <span class="text-indigo-400 text-base font-extrabold">${{ getAccumulatedProducts(activeDesign.id).reduce((acc, p) => acc + (p.details?.price || 0), 0) }} USD</span>
            </div>
          </div>
        </div>

        <!-- Botones de Acción de Factura -->
        <div class="p-6 border-t border-white/5 flex justify-between gap-3 bg-indigo-950/5">
          <button 
            type="button" 
            @click="printQuote" 
            class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
          <div class="flex gap-3">
            <button 
              type="button" 
              @click="showQuoteModal = false" 
              class="glass-btn-secondary py-2.5 px-4 text-xs font-bold"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              @click="confirmQuote" 
              class="bg-indigo-500 hover:bg-indigo-600 px-4 py-2.5 rounded-xl text-white font-bold text-xs border border-white/10 shadow transition-all flex items-center gap-1.5 cursor-pointer"
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
        class="print-page border border-slate-200 bg-white text-slate-900 rounded-3xl p-8 w-full max-w-4xl mx-auto my-4 flex flex-col gap-6"
      >
        <!-- Cabecera de la Factura -->
        <div class="flex justify-between items-start border-b border-slate-200 pb-4">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest">More House S.A.</span>
            <h2 class="text-lg font-black text-slate-800">Cotización de Diseño Virtual</h2>
            <p class="text-[9px] text-slate-500 mt-1">Etapa {{ idx + 1 }}: {{ design.label.split(' (')[0] }}</p>
          </div>
          <div class="text-right flex flex-col gap-1">
            <span class="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-slate-100 border border-slate-200 text-slate-600 font-mono">
              #MH-{{ design.id.replace('design-', '') }}
            </span>
            <p class="text-[9px] text-slate-500">Fecha: {{ new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
        </div>

        <!-- Datos del Proyecto -->
        <div class="grid grid-cols-2 gap-4 text-[10px] bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p class="text-slate-500 font-semibold">Cliente:</p>
            <p class="text-slate-800 font-bold mt-0.5">Cliente Invitado</p>
          </div>
          <div>
            <p class="text-slate-500 font-semibold">Espacio / Estilo:</p>
            <p class="text-slate-800 font-bold mt-0.5">{{ preferences.spaceType }} ({{ preferences.style }})</p>
          </div>
        </div>

        <!-- Tabla de Muebles Acumulados -->
        <div class="flex flex-col gap-2">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Concepto de Cotización (Muebles Acumulados)</span>
          <div class="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <table class="w-full text-left text-[10px] border-collapse" style="table-layout: fixed;">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[8px]">
                  <th class="p-2.5 pl-3 w-[45%]">Producto</th>
                  <th class="p-2.5 w-[15%]">Categoría</th>
                  <th class="p-2.5 w-[25%]">Medidas</th>
                  <th class="p-2.5 text-right pr-3 w-[15%]">Precio</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="item in getAccumulatedProducts(design.id)" 
                  :key="item.id"
                  class="border-b border-slate-100 last:border-0"
                >
                  <td class="p-2.5 pl-3 text-slate-800">
                    <div class="flex items-center gap-2.5">
                      <img :src="item.details?.image" class="w-8 h-8 object-cover rounded border border-slate-200 flex-shrink-0" />
                      <div>
                        <p class="font-bold text-slate-800">{{ item.name }}</p>
                        <p class="text-[8px] text-slate-500 max-w-sm leading-tight mt-0.5">{{ item.justification }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-2.5 text-slate-700">{{ item.details?.category }}</td>
                  <td class="p-2.5 text-slate-600 font-mono text-[9px]">{{ item.details?.dimensions }}</td>
                  <td class="p-2.5 text-right pr-3 font-bold text-slate-800">${{ item.details?.price || 0 }} USD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totalizadores -->
        <div class="flex flex-col items-end gap-1 self-end w-full max-w-xs pt-3 border-t border-slate-200">
          <div class="flex justify-between w-full text-[10px] text-slate-500">
            <span>Subtotal:</span>
            <span class="font-semibold text-slate-700">${{ getAccumulatedProducts(design.id).reduce((acc, p) => acc + (p.details?.price || 0), 0) }} USD</span>
          </div>
          <div class="flex justify-between w-full text-[10px] text-slate-500">
            <span>Total Cotizado:</span>
            <span class="text-indigo-600 font-extrabold">${{ getAccumulatedProducts(design.id).reduce((acc, p) => acc + (p.details?.price || 0), 0) }} USD</span>
          </div>
        </div>
    </div>
  </div>
</template>
