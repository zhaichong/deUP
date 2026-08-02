<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PatientRecord } from '../../types';
import { maskIdCard, maskPhone } from '../../utils/validators';
import { Search, Eye, Trash2, Calendar, FileText, PlusCircle } from 'lucide-vue-next';

const props = defineProps<{
  records: PatientRecord[];
}>();

const emit = defineEmits<{
  (e: 'view', record: PatientRecord): void;
  (e: 'delete', id: string): void;
  (e: 'createNew'): void;
}>();

const searchQuery = ref('');

const filteredRecords = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.records;
  return props.records.filter(
    (r) =>
      (r.patientName && r.patientName.toLowerCase().includes(q)) ||
      (r.idCard && r.idCard.toLowerCase().includes(q)) ||
      (r.phone && r.phone.includes(q)) ||
      r.examType.toLowerCase().includes(q)
  );
});
</script>

<template>
  <div class="space-y-4">
    <!-- 头部搜索栏 & 新增入口 -->
    <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <FileText class="w-4 h-4 text-teal-600" />
          内镜影像记录 ({{ filteredRecords.length }})
        </h3>
        <button
          @click="emit('createNew')"
          class="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition"
        >
          <PlusCircle class="w-3.5 h-3.5" />
          <span>手机上传</span>
        </button>
      </div>

      <!-- 手机端搜索框 -->
      <div class="relative">
        <Search class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="按身份证号 / 手机号检索已发记录..."
          class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- 空列表状态 -->
    <div
      v-if="filteredRecords.length === 0"
      class="bg-white rounded-2xl p-8 text-center border border-slate-200/80 space-y-3"
    >
      <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
        <FileText class="w-6 h-6" />
      </div>
      <p class="text-xs text-slate-500 font-medium">未找到符合条件的内镜记录</p>
      <button
        @click="emit('createNew')"
        class="inline-flex items-center space-x-1 text-xs text-teal-600 font-bold hover:underline"
      >
        <span>拍摄上传一份新内镜影像</span>
      </button>
    </div>

    <!-- 手机卡片式报告列表 -->
    <div v-else class="space-y-3">
      <div
        v-for="record in filteredRecords"
        :key="record.id"
        class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition space-y-3"
      >
        <!-- 卡片头部: 患者凭证与检查项目 -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-2.5">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-bold text-slate-900">{{ record.patientName || '内镜检查' }}</span>
              <span class="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-700 font-medium rounded-full border border-teal-200">
                {{ record.examType }}
              </span>
            </div>
            <div class="flex flex-col space-y-0.5 text-[11px] text-slate-500 mt-1 font-mono">
              <span v-if="record.idCard">身份证: {{ maskIdCard(record.idCard) }}</span>
              <span v-if="record.phone">手机号: {{ maskPhone(record.phone) }}</span>
            </div>
          </div>
          <span class="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <Calendar class="w-3 h-3 text-slate-300" />
            {{ record.examDate }}
          </span>
        </div>

        <!-- 镜检诊断简述 -->
        <div class="text-xs text-slate-700 space-y-1">
          <p class="font-bold text-teal-950 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            诊断: {{ record.diagnosis || '未见明显异常' }}
          </p>
        </div>

        <!-- 缩略图一览与操作按钮 -->
        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center space-x-1.5">
            <div
              v-for="img in record.images.slice(0, 4)"
              :key="img.id"
              class="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
            >
              <img :src="img.url" :alt="img.name" class="w-full h-full object-cover" />
            </div>
            <span v-if="record.images.length > 4" class="text-[10px] text-slate-400 pl-1">
              +{{ record.images.length - 4 }}张
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="emit('delete', record.id)"
              class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
              title="删除此记录"
            >
              <Trash2 class="w-4 h-4" />
            </button>
            <button
              @click="emit('view', record)"
              class="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition active:scale-95 shadow-sm"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>查看详情</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
