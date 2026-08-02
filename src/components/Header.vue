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
  <!-- 微信小程序标准 Header (去除了顶部“医生/患者”模式切换胶囊，实现入口独立) -->
  <header class="no-print bg-slate-900 text-white sticky top-0 z-40 shadow-sm border-b border-slate-800">
    <div class="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
      <!-- 小程序左侧 Logo 与标题 -->
      <div class="flex items-center space-x-2.5">
        <div class="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <Stethoscope class="w-4 h-4" />
        </div>
        <div>
          <h1 class="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            {{ activeMode === 'doctor' ? '内镜中心 · 医生工作台' : '内镜云检查报告' }}
          </h1>
          <p class="text-[10px] text-slate-400">
            {{ activeMode === 'doctor' ? '影像采集与报告生成' : '身份证/手机号快速调阅' }}
          </p>
        </div>
      </div>

      <!-- 右侧: 微信小程序经典右上角胶囊按钮 (WeChat Capsule) -->
      <div class="flex items-center space-x-1.5 px-3 py-1 bg-slate-800/90 rounded-full border border-slate-700/90 text-slate-300 text-xs">
        <button @click="emit('resetDemo')" title="重置示例数据" class="hover:text-teal-400 transition">
          <RefreshCw class="w-3.5 h-3.5" />
        </button>
        <span class="w-[1px] h-3 bg-slate-700"></span>
        <button title="小程序更多选项" class="hover:text-white transition">
          <MoreHorizontal class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </header>
</template>
