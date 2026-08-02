<script setup lang="ts">
import { Stethoscope, RefreshCw, MoreHorizontal } from 'lucide-vue-next';

defineProps<{
  activeMode: 'doctor' | 'patient';
}>();

const emit = defineEmits<{
  (e: 'resetDemo'): void;
}>();
</script>

<template>
  <!-- 智慧医疗内镜云平台 Header -->
  <header class="no-print bg-white/95 backdrop-blur-md text-slate-800 sticky top-0 z-40 border-b border-slate-100 shadow-2xs">
    <div class="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
      <!-- 医院品牌与系统标识 -->
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-2xs shrink-0">
          <Stethoscope class="w-4.5 h-4.5 stroke-[2.2]" />
        </div>

        <div>
          <h1 class="text-[13px] font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            {{ activeMode === 'doctor' ? '内镜中心 · 医生工作台' : '智慧医疗内镜中心' }}
          </h1>
          <p class="text-[10px] text-slate-400 font-medium">
            {{ activeMode === 'doctor' ? '影像采集与患者档案管理' : '电子内镜报告 · 云调阅平台' }}
          </p>
        </div>
      </div>

      <!-- 微信小程序右上角胶囊控件 -->
      <div class="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-200/80 text-slate-600 text-xs">
        <button
          @click="emit('resetDemo')"
          title="重置测试数据"
          class="hover:text-teal-600 p-0.5 rounded transition active:scale-90"
        >
          <RefreshCw class="w-3.5 h-3.5" />
        </button>
        <span class="w-[1px] h-3 bg-slate-200"></span>
        <button title="更多选项" class="hover:text-slate-900 p-0.5 rounded transition">
          <MoreHorizontal class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </header>
</template>
