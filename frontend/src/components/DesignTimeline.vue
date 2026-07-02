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
  <div class="flex flex-col gap-3 mt-1">
    <span class="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest pl-1">Línea de Tiempo del Diseño</span>
    <div class="flex gap-3.5 overflow-x-auto pb-3.5 pt-2.5 px-1.5 scrollbar-thin">
      <div 
        v-for="(design, index) in designHistory" 
        :key="design.id"
        @click="activeDesignId = design.id"
        :class="[
          activeDesignId === design.id 
            ? 'border-indigo-500 dark:border-indigo-400/70 ring-1 ring-indigo-500/50 dark:ring-indigo-400/35 shadow-lg dark:shadow-glow-indigo scale-[1.03]' 
            : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100 hover:scale-[1.02] hover:border-slate-300 dark:hover:border-white/20'
        ]"
        class="flex-shrink-0 w-28 border rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-slate-900/60 backdrop-blur-sm transition-all duration-300 ease-out relative"
      >
        <!-- LED Status Indicator -->
        <div 
          v-if="activeDesignId === design.id" 
          class="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse z-10"
        ></div>

        <div class="h-[4.5rem] w-full relative overflow-hidden rounded-t-[14px]">
          <img :src="design.imageUrl" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          <span class="absolute bottom-1.5 right-1.5 bg-slate-100/90 dark:bg-slate-950/75 backdrop-blur-sm border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded-md text-[8px] font-bold text-slate-600 dark:text-slate-300">
            {{ index === 0 ? 'Vacío' : `Etapa ${index}` }}
          </span>
        </div>
        <div class="px-2 py-1.5 text-center border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 min-h-[1.75rem] flex items-center justify-center rounded-b-[14px]">
          <input 
            v-if="editingStageId === design.id"
            v-model="editingStageLabel"
            @blur="saveStageLabel(design)"
            @keyup.enter="saveStageLabel(design)"
            type="text"
            class="w-full text-[9px] font-semibold bg-transparent text-slate-800 dark:text-slate-100 border-0 border-b border-indigo-500 dark:border-indigo-400/50 px-0 text-center focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            v-focus
          />
          <p 
            v-else
            @dblclick.stop="startRenameStage(design)"
            class="text-[9px] font-semibold text-slate-600 dark:text-slate-400 truncate px-0.5 select-none hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer transition-colors duration-200 w-full"
            title="Doble clic para renombrar"
          >
            {{ design.label }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
