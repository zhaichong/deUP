<script setup lang="ts">
import { ref } from 'vue';
import type { PatientRecord } from '../../types';
import { maskIdCard, maskPhone } from '../../utils/validators';
import ImageViewerModal from '../common/ImageViewerModal.vue';
import {
  ArrowLeft,
  ShieldCheck,
  ZoomIn,
  FileDown,
  Building2,
  Calendar,
  User,
  HeartPulse,
  Stamp
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
    <!-- 顶部操作栏 (打印时不显示) -->
    <div class="no-print flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
      <button
        @click="emit('back')"
        class="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition active:scale-95"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>返回查询入口</span>
      </button>

      <button
        @click="handleExportPDF"
        class="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition shadow-sm active:scale-95"
      >
        <FileDown class="w-4 h-4" />
        <span>导出 / 打印 PDF 报告</span>
      </button>
    </div>

    <!-- 市中医医院 官方正规电子内镜检查报告单 Card -->
    <div class="print-card bg-white rounded-3xl border border-emerald-900/10 p-6 shadow-sm space-y-6 relative overflow-hidden">
      <!-- 1. 医院正式抬头与报告单名称 -->
      <div class="border-b-2 border-emerald-900/80 pb-4 text-center relative space-y-1">
        <div class="flex items-center justify-center space-x-2">
          <div class="w-6 h-6 rounded-lg bg-emerald-800 text-amber-300 font-serif font-bold text-[10px] flex items-center justify-center">
            国医
          </div>
          <h2 class="text-lg font-black tracking-wide text-slate-900 font-serif">
            市中医医院
          </h2>
          <span class="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-300 rounded font-serif font-bold">
            三级甲等
          </span>
        </div>
        <p class="text-[9px] text-slate-400 font-sans tracking-widest uppercase">
          Hospital of Traditional Chinese Medicine
        </p>
        <h3 class="text-sm font-bold text-emerald-900 tracking-wider font-serif pt-1">
          脾胃病科（消化内镜室）检查报告单
        </h3>
        <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 px-1">
          <span>档案编号: {{ record.id }}</span>
          <span>检查项目: {{ record.examType }}</span>
        </div>
      </div>

      <!-- 2. 患者基本信息与就诊凭证表 -->
      <div class="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-y-2.5 gap-x-4 text-xs">
        <div>
          <span class="text-slate-400 block text-[10px]">检查日期</span>
          <span class="font-bold text-slate-800 font-mono">{{ record.examDate }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">就诊科室</span>
          <span class="text-slate-700 font-medium">{{ record.department || '脾胃病科（内镜室）' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">检查医生</span>
          <span class="text-slate-800 font-bold">{{ record.doctorName }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">报告状态</span>
          <span class="text-emerald-700 font-bold">已审核发布</span>
        </div>

        <div v-if="record.idCard" class="col-span-2 pt-1 border-t border-slate-200/50">
          <span class="text-slate-400 block text-[10px]">受检人身份证号</span>
          <span class="font-mono text-slate-800 font-medium">{{ maskIdCard(record.idCard) }}</span>
        </div>
        <div v-if="record.phone" class="col-span-2 pt-1 border-t border-slate-200/50">
          <span class="text-slate-400 block text-[10px]">受检人联系电话</span>
          <span class="font-mono text-slate-800 font-medium">{{ maskPhone(record.phone) }}</span>
        </div>
      </div>

      <!-- 3. 镜检所见与中西医结合诊断建议 -->
      <div class="space-y-4">
        <!-- 镜检所见 -->
        <div v-if="record.findings" class="space-y-1.5">
          <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-3 border-emerald-700 pl-2">
            内镜镜检所见 (Endoscopic Findings)
          </h4>
          <div class="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 text-xs leading-relaxed text-slate-800 whitespace-pre-line">
            {{ record.findings }}
          </div>
        </div>

        <!-- 诊断结论 -->
        <div v-if="record.diagnosis" class="space-y-1.5">
          <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-3 border-amber-600 pl-2">
            内镜诊断意见 (Diagnostic Impression)
          </h4>
          <div class="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 text-xs font-bold text-emerald-950 leading-relaxed whitespace-pre-line">
            {{ record.diagnosis }}
          </div>
        </div>

        <!-- 处置建议与中医调护 -->
        <div v-if="record.recommendations" class="space-y-1.5">
          <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-3 border-emerald-900 pl-2">
            中西医结合调治建议 (Clinical Guidance)
          </h4>
          <div class="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-200/60 text-xs text-amber-950 leading-relaxed space-y-1">
            <p>{{ record.recommendations }}</p>
            <p class="text-[11px] text-amber-900/80 font-serif pt-1 border-t border-amber-200/50">
              * 中医调护：宜清淡饮食，忌辛辣生冷；情志调畅，劳逸结合；遵医嘱定期复查胃肠镜。
            </p>
          </div>
        </div>
      </div>

      <!-- 4. 高清内镜图谱 Gallery (轻触看大图) -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-l-3 border-emerald-700 pl-2">
            内镜高清影像图谱 (共 {{ record.images.length }} 幅)
          </h4>
          <span class="no-print text-[10px] text-emerald-700 font-medium">轻触可全屏放大</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="(img, index) in record.images"
            :key="img.id"
            @click="openImage(index)"
            class="group relative bg-slate-900 rounded-2xl overflow-hidden cursor-pointer shadow-2xs hover:shadow-sm transition aspect-square border border-slate-200"
          >
            <img :src="img.url" :alt="img.name" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            
            <!-- 放大镜悬浮提示 -->
            <div class="no-print absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <ZoomIn class="w-6 h-6 text-white drop-shadow" />
            </div>

            <!-- 底部部位标注标签 -->
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 flex items-center justify-between text-white">
              <span class="text-[10px] font-medium truncate">{{ img.tag || img.name }}</span>
              <span class="text-[9px] px-1.5 py-0.2 bg-emerald-600/90 rounded font-mono">HD</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 官方朱砂红电子公章与出具防伪落款 -->
      <div class="pt-6 border-t border-slate-200 relative flex items-center justify-between text-[11px] text-slate-500">
        <div class="space-y-1">
          <div class="flex items-center space-x-1.5 text-emerald-800">
            <ShieldCheck class="w-4 h-4 text-emerald-700" />
            <span class="font-bold">市中医医院 · 电子报告防伪查验已核准</span>
          </div>
          <p class="text-[10px] text-slate-400">报告医师：{{ record.doctorName }} | 审核医师：主任医师</p>
          <p class="text-[10px] text-slate-400">报告签发时间：{{ record.examDate }}</p>
        </div>

        <!-- 拟真中医院朱砂红防伪印章 -->
        <div class="relative -mr-2">
          <div class="w-20 h-20 rounded-full border-2 border-red-600/80 text-red-600 flex flex-col items-center justify-center p-1 text-center rotate-[-12deg] select-none opacity-85 shadow-2xs pointer-events-none">
            <span class="text-[7.5px] font-serif font-black tracking-widest leading-none">★ 市中医医院 ★</span>
            <span class="text-[8px] font-serif font-bold my-0.5 leading-none">检验专用章</span>
            <span class="text-[6px] font-mono leading-none">(电子防伪11)</span>
          </div>
        </div>
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
