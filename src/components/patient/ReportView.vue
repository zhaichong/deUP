<script setup lang="ts">
import { ref } from 'vue';
import type { PatientRecord } from '../../types';
import { maskIdCard, maskPhone } from '../../utils/validators';
import ImageViewerModal from '../common/ImageViewerModal.vue';
import { ArrowLeft, ShieldCheck, Stethoscope, ZoomIn } from 'lucide-vue-next';

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
</script>

<template>
  <div class="space-y-4 max-w-3xl mx-auto pb-20">
    <!-- 顶部操作栏 -->
    <div class="no-print flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
      <button
        @click="emit('back')"
        class="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition active:scale-95"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>返回查询入口</span>
      </button>
    </div>

    <!-- 规范化内镜报告单 Card -->
    <div class="print-card bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6 relative overflow-hidden">
      <!-- 医院与防伪水印背景标记 -->
      <div class="border-b-2 border-slate-900 pb-4 text-center relative">
        <div class="flex items-center justify-center space-x-2 mb-1">
          <Stethoscope class="w-6 h-6 text-teal-600" />
          <h2 class="text-lg font-black tracking-tight text-slate-900">智慧医疗内镜中心</h2>
        </div>
        <h3 class="text-sm font-bold text-teal-800 tracking-wider">电子内镜检查报告单</h3>
        <p class="text-[10px] text-slate-400 font-mono mt-1">报告编号: {{ record.id }}</p>
      </div>

      <!-- 患者凭证资料网格 -->
      <div class="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-y-2.5 gap-x-4 text-xs">
        <div>
          <span class="text-slate-400 block text-[10px]">检查项目</span>
          <span class="font-bold text-teal-700">{{ record.examType }}</span>
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
          <span class="text-slate-400 block text-[10px]">检查/报告医生</span>
          <span class="text-slate-700 font-semibold">{{ record.doctorName }}</span>
        </div>

        <div v-if="record.idCard" class="col-span-2">
          <span class="text-slate-400 block text-[10px]">调阅凭证 (身份证号)</span>
          <span class="font-mono text-slate-800 font-medium">{{ maskIdCard(record.idCard) }}</span>
        </div>
        <div v-if="record.phone" class="col-span-2">
          <span class="text-slate-400 block text-[10px]">调阅凭证 (手机号码)</span>
          <span class="font-mono text-slate-800 font-medium">{{ maskPhone(record.phone) }}</span>
        </div>
      </div>

      <!-- 镜检所见与内镜诊断结论 -->
      <div class="space-y-4">
        <!-- 镜检所见 -->
        <div v-if="record.findings" class="space-y-1.5">
          <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-3 border-teal-600 pl-2">
            内镜镜检所见 (Endoscopic Findings)
          </h4>
          <div class="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
            {{ record.findings }}
          </div>
        </div>

        <!-- 诊断结论 -->
        <div v-if="record.diagnosis" class="space-y-1.5">
          <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-3 border-cyan-600 pl-2">
            内镜诊断结论 (Diagnostic Impression)
          </h4>
          <div class="p-3 bg-gradient-to-r from-teal-50 to-cyan-50/50 rounded-xl border border-teal-200/60 text-xs font-bold text-slate-900 leading-relaxed whitespace-pre-line">
            {{ record.diagnosis }}
          </div>
        </div>

        <!-- 建议与处置 -->
        <div v-if="record.recommendations" class="space-y-1.5">
          <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-3 border-slate-400 pl-2">
            处置意见与建议 (Recommendations)
          </h4>
          <div class="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed">
            {{ record.recommendations }}
          </div>
        </div>
      </div>

      <!-- 高清内镜图谱 Gallery (轻触看大图) -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-3 border-teal-600 pl-2">
            内镜高清影像图谱 ({{ record.images.length }}张)
          </h4>
          <span class="text-[10px] text-teal-600 font-medium">点击可全屏放大查看细节</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            v-for="(img, index) in record.images"
            :key="img.id"
            @click="openImage(index)"
            class="group relative bg-slate-900 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition aspect-square border border-slate-200"
          >
            <img :src="img.url" :alt="img.name" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            
            <!-- 放大镜图标 hover -->
            <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <ZoomIn class="w-7 h-7 text-white drop-shadow" />
            </div>

            <!-- 底部部位标注标签 -->
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 flex items-center justify-between text-white">
              <span class="text-[10px] font-medium truncate">{{ img.tag || img.name }}</span>
              <span class="text-[9px] px-1.5 py-0.2 bg-teal-500/80 rounded font-mono">HD</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 页脚落款与验证印章 -->
      <div class="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div class="flex items-center space-x-1 text-teal-700">
          <ShieldCheck class="w-4 h-4 text-teal-600" />
          <span class="font-medium">官方数字电子签章防伪验真已核验</span>
        </div>
        <span>发布日期: {{ record.examDate }}</span>
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
