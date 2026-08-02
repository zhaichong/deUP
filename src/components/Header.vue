<script setup lang="ts">
import { RefreshCw, MoreHorizontal, ShieldCheck } from 'lucide-vue-next';

defineProps<{
  activeMode: 'doctor' | 'patient';
}>();

const emit = defineEmits<{
  (e: 'resetDemo'): void;
}>();
</script>

<template>
  <!-- 淄博市中医医院 官方小程序 Header -->
  <header class="no-print bg-white/95 backdrop-blur-md text-slate-800 sticky top-0 z-40 border-b border-emerald-900/10 shadow-2xs">
    <div class="max-w-md mx-auto px-3.5 py-2.5 flex items-center justify-between">
      <!-- 医院官方标识与院名 -->
      <div class="flex items-center space-x-2.5">
        <!-- 中医特色医院徽章 (翡翠深绿 + 琥珀金) -->
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 border border-amber-600/30 flex flex-col items-center justify-center text-white shadow-xs shrink-0">
          <span class="text-[11px] font-serif font-black tracking-widest text-amber-300 leading-none">淄博</span>
          <span class="text-[8px] font-sans font-medium text-emerald-100/90 leading-none mt-0.5">中医</span>
        </div>

        <div>
          <div class="flex items-center space-x-1.5">
            <h1 class="text-[13px] font-black text-emerald-950 tracking-tight">
              淄博市中医医院
            </h1>
            <span class="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-300/80 rounded text-[9px] font-bold font-serif">
              三甲
            </span>
          </div>
          <p class="text-[10px] text-emerald-800/70 font-medium flex items-center gap-1 mt-0.5">
            <span>脾胃病科（消化内镜室）</span>
            <span class="text-slate-300">|</span>
            <span>{{ activeMode === 'doctor' ? '医生工作台' : '电子报告云查阅' }}</span>
          </p>
        </div>
      </div>

      <!-- 微信小程序右上角胶囊控件 -->
      <div class="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50/90 rounded-full border border-slate-200 text-slate-600 text-xs shadow-2xs">
        <button
          @click="emit('resetDemo')"
          title="重置测试数据"
          class="hover:text-emerald-700 p-0.5 rounded transition active:scale-90"
        >
          <RefreshCw class="w-3.5 h-3.5" />
        </button>
        <span class="w-[1px] h-3 bg-slate-200"></span>
        <button title="更多功能" class="hover:text-slate-900 p-0.5 rounded transition">
          <MoreHorizontal class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </header>
</template>
