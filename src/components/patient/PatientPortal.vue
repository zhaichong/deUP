<script setup lang="ts">
import { ref } from 'vue';
import type { PatientRecord } from '../../types';
import { queryRecordsByIdCard } from '../../api';
import { validateIdCard, maskIdCard } from '../../utils/validators';
import ReportView from './ReportView.vue';
import {
  Search,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  FileText,
  Sparkles,
  ChevronRight,
  Calendar,
  User,
  CheckCircle,
  ImageIcon,
  Building2,
  HeartPulse,
  BookOpen
} from 'lucide-vue-next';

const idCardInput = ref('');
const searchedRecords = ref<PatientRecord[] | null>(null);
const selectedRecord = ref<PatientRecord | null>(null);
const isSearching = ref(false);
const errorMessage = ref('');

// 演示测试身份证号
const DEMO_ID_CARD = '110101197405122334';

async function handleSearch(targetId?: string) {
  const target = (targetId || idCardInput.value).trim().toUpperCase();
  errorMessage.value = '';

  if (!target) {
    errorMessage.value = '请输入您的身份证号码以调阅内镜报告';
    return;
  }

  const check = validateIdCard(target);
  if (!check.valid) {
    errorMessage.value = check.message || '请输入有效的18位身份证号码';
    return;
  }

  isSearching.value = true;
  idCardInput.value = target;

  try {
    const results = await queryRecordsByIdCard(target);
    searchedRecords.value = results;
    if (results.length === 1) {
      selectedRecord.value = results[0];
    } else {
      selectedRecord.value = null;
    }
  } catch (err) {
    errorMessage.value = '医院内网云数据库响应较慢，请稍后重试';
  } finally {
    isSearching.value = false;
  }
}

function handleDemoClick() {
  handleSearch(DEMO_ID_CARD);
}

function resetSearch() {
  searchedRecords.value = null;
  selectedRecord.value = null;
  idCardInput.value = '';
  errorMessage.value = '';
}
</script>

<template>
  <div class="space-y-4">
    <!-- 详情视图: 当选中一份报告单时展示官方电子报告单 -->
    <ReportView
      v-if="selectedRecord"
      :record="selectedRecord"
      @back="selectedRecord = null"
    />

    <!-- 患者端主界面 (智慧医疗内镜云平台) -->
    <div v-else class="space-y-4">
      <!-- 1. 顶部医疗便民横幅 -->
      <div class="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-5 text-white shadow-sm relative overflow-hidden">
        <div class="relative z-10 space-y-2">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-white/10 text-teal-100 rounded-full text-[10px] font-medium tracking-wider">
              <span>内镜云档案 · 官方直联</span>
            </span>
            <span class="text-[10px] text-teal-200/90 flex items-center gap-1">
              <ShieldCheck class="w-3.5 h-3.5 text-teal-300" />
              <span>官方电子凭证</span>
            </span>
          </div>

          <div>
            <h2 class="text-base font-bold text-white tracking-tight">
              智慧医疗内镜中心
            </h2>
            <p class="text-xs text-teal-100/80 mt-0.5">
              电子内镜中心（胃镜 / 肠镜）报告与影像便民查阅平台
            </p>
          </div>
        </div>
      </div>

      <!-- 2. 查询卡片 (Patient Query Card) -->
      <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div class="space-y-1">
          <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <CreditCard class="w-4 h-4 text-teal-600" />
            患者凭证查询
          </h3>
          <p class="text-xs text-slate-400">
            请输入受检患者本人18位身份证号，实时调阅图谱与诊断建议
          </p>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="errorMessage"
          class="p-3 bg-red-50 text-red-600 rounded-2xl text-xs flex items-center space-x-2 border border-red-100"
        >
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- 搜索表单 -->
        <form @submit.prevent="handleSearch()" class="space-y-3">
          <div class="relative">
            <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600">
              <CreditCard class="w-4 h-4" />
            </div>
            <input
              v-model="idCardInput"
              type="text"
              maxlength="18"
              placeholder="请输入受检人18位身份证号"
              class="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none transition"
            />
            <button
              v-if="idCardInput"
              type="button"
              @click="idCardInput = ''"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 text-xs flex items-center justify-center transition"
            >
              &times;
            </button>
          </div>

          <button
            type="submit"
            :disabled="isSearching"
            class="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold rounded-2xl text-xs tracking-wider transition shadow-sm shadow-teal-700/20 flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            <Search class="w-4 h-4 stroke-[2.5]" />
            <span>{{ isSearching ? '正在加密调阅中...' : '查 询 检 查 报 告' }}</span>
          </button>
        </form>

        <!-- 快速测试辅助 -->
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-[11px] text-slate-400">没有账号？点击体验：</span>
          <button
            type="button"
            @click="handleDemoClick"
            class="px-2.5 py-1 bg-teal-50 hover:bg-teal-100/80 text-teal-700 rounded-xl text-[11px] font-medium transition flex items-center space-x-1"
          >
            <Sparkles class="w-3 h-3 text-amber-500" />
            <span>填入测试示例号</span>
          </button>
        </div>
      </div>

      <!-- 3. 查询结果展示 -->
      <div v-if="searchedRecords !== null" class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold text-slate-800">
            检索到 {{ searchedRecords.length }} 份内镜检查档案
          </span>
          <button @click="resetSearch" class="text-xs text-teal-600 hover:underline">
            重新输入
          </button>
        </div>

        <!-- 结果为空 -->
        <div
          v-if="searchedRecords.length === 0"
          class="p-8 bg-white rounded-3xl border border-slate-100 text-center space-y-2.5 shadow-2xs"
        >
          <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <FileText class="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800">暂未查到该身份证的内镜报告</h4>
            <p class="text-[11px] text-slate-400 mt-1">
              如刚完成胃肠镜检查，请等待内镜室医生上传影像并出具结论（通常为检查后15-30分钟）
            </p>
          </div>
        </div>

        <!-- 找到报告单 -->
        <div v-else class="space-y-3">
          <div
            v-for="rec in searchedRecords"
            :key="rec.id"
            @click="selectedRecord = rec"
            class="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:border-teal-500 hover:shadow-md transition cursor-pointer space-y-3.5 group active:scale-[0.99]"
          >
            <!-- 头部：医院科室与发布状态 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                <h4 class="text-sm font-bold text-slate-900">{{ rec.examType }}报告单</h4>
              </div>
              <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle class="w-3 h-3 text-emerald-500" /> 已出具报告
              </span>
            </div>

            <!-- 关键检查信息 -->
            <div class="bg-slate-50/90 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div class="flex items-center space-x-1.5">
                <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>检查日期: <strong class="text-slate-800 font-mono">{{ rec.examDate }}</strong></span>
              </div>
              <div class="flex items-center space-x-1.5">
                <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>检查医生: <strong class="text-slate-800">{{ rec.doctorName }}</strong></span>
              </div>
              <div class="col-span-2 flex items-center space-x-1.5 text-slate-500 pt-1 border-t border-slate-200/50">
                <Building2 class="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>就诊科室: <strong>智慧医疗内镜中心 · {{ rec.department || '消化内镜室' }}</strong></span>
              </div>
            </div>

            <!-- 诊断结论摘要 -->
            <div v-if="rec.diagnosis" class="text-xs text-slate-700 space-y-1">
              <span class="text-[11px] font-bold text-teal-900 block">内镜诊断结论：</span>
              <p class="p-2.5 bg-teal-50/40 rounded-xl text-slate-900 text-xs leading-relaxed line-clamp-2 border border-teal-100">
                {{ rec.diagnosis }}
              </p>
            </div>

            <!-- 图像缩略预览条 -->
            <div v-if="rec.images && rec.images.length > 0" class="space-y-1.5">
              <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span class="flex items-center gap-1">
                  <ImageIcon class="w-3.5 h-3.5 text-teal-600" />
                  高清内镜图谱 (共 {{ rec.images.length }} 张)
                </span>
                <span class="text-teal-600 font-medium">轻触查看大图</span>
              </div>
              <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                <div
                  v-for="img in rec.images.slice(0, 4)"
                  :key="img.id"
                  class="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 relative"
                >
                  <img :src="img.url" :alt="img.name" class="w-full h-full object-cover" />
                  <span class="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center truncate px-0.5">
                    {{ img.tag || '病灶' }}
                  </span>
                </div>
                <div
                  v-if="rec.images.length > 4"
                  class="w-14 h-14 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200"
                >
                  +{{ rec.images.length - 4 }}
                </div>
              </div>
            </div>

            <!-- 底部跳转卡片条 -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-[11px] text-slate-400">智慧医疗内镜中心 · 官方防伪</span>
              <span class="text-xs font-bold text-teal-600 group-hover:translate-x-1 transition flex items-center gap-1">
                查看完整报告 & 导出 PDF <ChevronRight class="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 便民就医与调阅指南 -->
      <div v-else class="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <BookOpen class="w-4 h-4 text-teal-600" />
            内镜检查调阅流程指南
          </h3>
          <span class="text-[10px] text-slate-400">消化内镜中心</span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="p-3 bg-slate-50 rounded-2xl space-y-1">
            <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center mx-auto">
              1
            </div>
            <p class="font-bold text-slate-800 text-[11px]">内镜检查</p>
            <p class="text-[9px] text-slate-400">医生高清采图录入</p>
          </div>

          <div class="p-3 bg-slate-50 rounded-2xl space-y-1">
            <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center mx-auto">
              2
            </div>
            <p class="font-bold text-slate-800 text-[11px]">凭证核验</p>
            <p class="text-[9px] text-slate-400">身份证号安全调阅</p>
          </div>

          <div class="p-3 bg-slate-50 rounded-2xl space-y-1">
            <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center mx-auto">
              3
            </div>
            <p class="font-bold text-slate-800 text-[11px]">导出报告</p>
            <p class="text-[9px] text-slate-400">一键保存打印PDF</p>
          </div>
        </div>

        <div class="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 text-teal-800 text-[11px] leading-relaxed flex items-start space-x-2">
          <ShieldCheck class="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <span>本平台严格遵循医疗数据安全规范，所有图像与诊断信息均经过数字验真与加密保护。</span>
        </div>
      </div>
    </div>
  </div>
</template>
