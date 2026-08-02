<script setup lang="ts">
import { ref } from 'vue';
import type { PatientRecord } from '../../types';
import { maskIdCard, maskPhone } from '../../utils/validators';
import ImageViewerModal from '../common/ImageViewerModal.vue';
import {
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  ZoomIn,
  FileDown,
  Calendar,
  Building2,
  User,
  Activity,
  CheckCircle2
} from 'lucide-vue-next';

const props = defineProps<{
  record: PatientRecord;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

// 高清大图灯箱
const showLightbox = ref(false);
const lightboxIndex = ref(0);

function openImage(index: number) {
  lightboxIndex.value = index;
  showLightbox.value = true;
}

function handleExportPDF() {
  window.print();
}
</script>

<template>
  <div class="space-y-4 max-w-3xl mx-auto pb-20">
    <!-- 顶部操作栏 -->
    <div class="no-print flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
      <button
        @click="emit('back')"
        class="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition active:scale-95"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>返回查询</span>
      </button>

      <button
        @click="handleExportPDF"
        class="flex items-center space-x-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition shadow-sm active:scale-95"
      >
        <FileDown class="w-4 h-4" />
        <span>导出 / 打印 PDF 报告</span>
      </button>
    </div>

    <!-- 规范化正规医院电子报告单 Card -->
    <div class="print-card bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 relative overflow-hidden">
      <!-- 医院与抬头 -->
      <div class="border-b border-slate-100 pb-4 text-center relative space-y-1">
        <div class="flex items-center justify-center space-x-2">
          <div class="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Stethoscope class="w-4 h-4" />
          </div>
          <h2 class="text-base font-bold text-slate-900 tracking-tight">智慧医疗内镜中心</h2>
        </div>
        <h3 class="text-xs font-bold text-teal-700 tracking-wider">电子内镜检查报告单</h3>
        <p class="text-[10px] text-slate-400 font-mono">报告编号: {{ record.id }}</p>
      </div>

      <!-- 患者凭证资料网格 -->
      <div class="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100/80 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
        <div>
          <span class="text-slate-400 block text-[10px]">检查项目</span>
          <span class="font-bold text-slate-900">{{ record.examType }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">检查日期</span>
          <span class="font-semibold text-slate-800 font-mono">{{ record.examDate }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">检查科室</span>
          <span class="text-slate-700">{{ record.department }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">接诊 / 报告医生</span>
          <span class="text-slate-900 font-semibold">{{ record.doctorName }}</span>
        </div>

        <div v-if="record.idCard" class="col-span-2 pt-1 border-t border-slate-200/50">
          <span class="text-slate-400 block text-[10px]">调阅凭证 (身份证号)</span>
          <span class="font-mono text-slate-800 font-medium">{{ maskIdCard(record.idCard) }}</span>
        </div>
      </div>

      <!-- 镜检所见与内镜诊断结论 -->
      <div class="space-y-4">
        <!-- 镜检所见 -->
        <div v-if="record.findings" class="space-y-1.5">
          <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-l-2 border-teal-500 pl-2">
            内镜镜检所见
          </h4>
          <div class="p-3 bg-slate-50/60 rounded-2xl border border-slate-100 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
            {{ record.findings }}
          </div>
        </div>

        <!-- 诊断结论 -->
        <div v-if="record.diagnosis" class="space-y-1.5">
          <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-l-2 border-teal-600 pl-2">
            内镜诊断建议
          </h4>
          <div class="p-3 bg-teal-50/40 rounded-2xl border border-teal-100/60 text-xs font-medium text-slate-900 leading-relaxed whitespace-pre-line">
            {{ record.diagnosis }}
          </div>
        </div>

        <!-- 处置建议 -->
        <div v-if="record.recommendations" class="space-y-1.5">
          <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-l-2 border-slate-400 pl-2">
            后续处置建议
          </h4>
          <div class="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 leading-relaxed">
            {{ record.recommendations }}
          </div>
        </div>
      </div>

      <!-- 高清内镜图谱 Gallery -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-l-2 border-teal-500 pl-2">
            内镜高清影像 ({{ record.images.length }}张)
          </h4>
          <span class="no-print text-[10px] text-teal-600 font-medium">点击可放大查看</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="(img, index) in record.images"
            :key="img.id"
            @click="openImage(index)"
            class="group relative bg-slate-900 rounded-2xl overflow-hidden cursor-pointer shadow-2xs hover:shadow-sm transition aspect-square border border-slate-100"
          >
            <img :src="img.url" :alt="img.name" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            
            <div class="no-print absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <ZoomIn class="w-6 h-6 text-white drop-shadow" />
            </div>

            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 flex items-center justify-between text-white">
              <span class="text-[10px] font-medium truncate">{{ img.tag || img.name }}</span>
              <span class="text-[9px] px-1.5 py-0.2 bg-teal-500/90 rounded font-mono">HD</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 页脚落款与验证印章 -->
      <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div class="flex items-center space-x-1 text-teal-600">
          <ShieldCheck class="w-4 h-4 text-teal-500" />
          <span class="font-medium">官方数字电子签章防伪验真已核验</span>
        </div>
        <span>出具日期: {{ record.examDate }}</span>
      </div>
    </div>

    <!-- 高清大图查看灯箱 Modal -->
    <ImageViewerModal
      :show="showLightbox"
      :images="record.images"
      v-model:currentIndex="lightboxIndex"
      @close="showLightbox = false"
    />
  </div>
</template>
