<script setup lang="ts">
import { useDesigner } from '../composables/useDesigner';

const { 
  designHistory, 
  activeDesignId, 
  editingStageId, 
  editingStageLabel, 
  saveStageLabel, 
  startRenameStage 
} = useDesigner();

// Local focus directive for renaming input auto-focus
const vFocus = {
  mounted: (el: HTMLInputElement) => el.focus()
};
</script>

<template>
  <div class="flex flex-col gap-2 mt-1">
    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Línea de Tiempo del Diseño (Historial)</span>
    <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      <div 
        v-for="(design, index) in designHistory" 
        :key="design.id"
        @click="activeDesignId = design.id"
        :class="[
          activeDesignId === design.id ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.02]' : 'border-white/10 opacity-70 hover:opacity-100 hover:scale-[1.01]'
        ]"
        class="flex-shrink-0 w-24 border rounded-xl overflow-hidden cursor-pointer bg-slate-950 transition-all duration-200"
      >
        <div class="h-16 w-full relative">
          <img :src="design.imageUrl" class="w-full h-full object-cover" />
          <span class="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[8px] font-bold text-slate-300">
            {{ index === 0 ? 'Vacío' : `Etapa ${index}` }}
          </span>
        </div>
        <div class="p-1 text-center border-t border-white/5 bg-slate-950">
          <input 
            v-if="editingStageId === design.id"
            v-model="editingStageLabel"
            @blur="saveStageLabel(design)"
            @keyup.enter="saveStageLabel(design)"
            type="text"
            class="w-full text-[9px] font-bold bg-white/10 text-slate-100 rounded px-0.5 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
            v-focus
          />
          <p 
            v-else
            @dblclick.stop="startRenameStage(design)"
            class="text-[9px] font-bold text-slate-300 truncate px-0.5 select-none hover:text-indigo-300 cursor-pointer"
            title="Doble clic para renombrar"
          >
            {{ design.label }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
