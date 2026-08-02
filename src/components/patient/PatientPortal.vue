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
  Stethoscope,
  CheckCircle,
  ArrowRight,
  ImageIcon,
  Download
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
    errorMessage.value = '请输入您的身份证号码';
    return;
  }

  const check = validateIdCard(target);
  if (!check.valid) {
    errorMessage.value = check.message || '请输入正确的身份证号码';
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
    errorMessage.value = '网络查询异常，请稍后重试';
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
    <!-- 详情视图: 当选中一份报告时展示完整报告单 -->
    <ReportView
      v-if="selectedRecord"
      :record="selectedRecord"
      @back="selectedRecord = null"
    />

    <!-- 患者端主界面 -->
    <div v-else class="space-y-4">
      <!-- 1. 查询核心卡片 (Clean Minimalist Search Card) -->
      <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <!-- 头部标题区 -->
        <div class="space-y-1">
          <div class="flex items-center space-x-1.5 text-teal-600 text-xs font-semibold">
            <ShieldCheck class="w-4 h-4" />
            <span>官方电子内镜档案调阅</span>
          </div>
          <h2 class="text-lg font-bold text-slate-900">输入身份证号查报告</h2>
          <p class="text-xs text-slate-400">
            凭本人有效身份证号即可调阅内镜检查影像与诊断建议
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

        <!-- 输入框表单 -->
        <form @submit.prevent="handleSearch()" class="space-y-3">
          <div class="relative">
            <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <CreditCard class="w-4 h-4 text-teal-600" />
            </div>
            <input
              v-model="idCardInput"
              type="text"
              maxlength="18"
              placeholder="请输入18位身份证号码"
              class="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition"
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
            class="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold rounded-2xl text-xs tracking-wide transition shadow-sm shadow-teal-600/20 flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            <Search class="w-4 h-4 stroke-[2.2]" />
            <span>{{ isSearching ? '正在加密调阅中...' : '查 询 报 告' }}</span>
          </button>
        </form>

        <!-- 快捷测试辅助 -->
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

      <!-- 2. 查询结果区域 -->
      <div v-if="searchedRecords !== null" class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold text-slate-800">
            共找到 {{ searchedRecords.length }} 份检查报告
          </span>
          <button @click="resetSearch" class="text-xs text-slate-400 hover:text-teal-600 transition">
            清除查询
          </button>
        </div>

        <!-- 结果为空 -->
        <div
          v-if="searchedRecords.length === 0"
          class="p-8 bg-white rounded-3xl border border-slate-100 text-center space-y-2.5 shadow-sm"
        >
          <div class="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <FileText class="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-800">未查到该身份证的检查报告</h3>
            <p class="text-[11px] text-slate-400 mt-1">
              请核对身份证号是否输入正确，或稍后咨询检查医生是否已完成上传
            </p>
          </div>
        </div>

        <!-- 找到报告列表卡片 -->
        <div v-else class="space-y-3">
          <div
            v-for="rec in searchedRecords"
            :key="rec.id"
            @click="selectedRecord = rec"
            class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:border-teal-400 hover:shadow-md transition cursor-pointer space-y-3.5 group active:scale-[0.99]"
          >
            <!-- 头部：项目名称与出报告状态 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h4 class="text-sm font-bold text-slate-900">{{ rec.examType }}报告</h4>
              </div>
              <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-100 flex items-center gap-1">
                <CheckCircle class="w-3 h-3 text-emerald-500" /> 已出报告
              </span>
            </div>

            <!-- 基本属性信息 -->
            <div class="bg-slate-50/80 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div class="flex items-center space-x-1.5">
                <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>检查日期: <strong class="text-slate-800 font-mono">{{ rec.examDate }}</strong></span>
              </div>
              <div class="flex items-center space-x-1.5">
                <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>接诊医师: <strong class="text-slate-800">{{ rec.doctorName }}</strong></span>
              </div>
            </div>

            <!-- 诊断结论摘要 -->
            <div v-if="rec.diagnosis" class="text-xs text-slate-700 space-y-1">
              <span class="text-[11px] font-semibold text-teal-800 block">诊断建议：</span>
              <p class="p-2.5 bg-teal-50/50 rounded-xl text-slate-800 text-xs leading-relaxed line-clamp-2 border border-teal-100/50">
                {{ rec.diagnosis }}
              </p>
            </div>

            <!-- 图像缩略预览条 -->
            <div v-if="rec.images && rec.images.length > 0" class="space-y-1.5">
              <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span class="flex items-center gap-1">
                  <ImageIcon class="w-3.5 h-3.5 text-slate-400" />
                  已拍摄影像 ({{ rec.images.length }}张)
                </span>
                <span class="text-teal-600 font-medium">点击可查看大图</span>
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
                  class="w-14 h-14 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200"
                >
                  +{{ rec.images.length - 4 }}
                </div>
              </div>
            </div>

            <!-- 底部跳转卡片条 -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-[11px] text-slate-400">支持在线预览与保存 PDF</span>
              <span class="text-xs font-bold text-teal-600 group-hover:translate-x-1 transition flex items-center gap-1">
                查看完整报告 & 导出 PDF <ChevronRight class="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 未搜索时的官方服务指南与服务流程 (3-Step Guide) -->
      <div v-else class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <h3 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Stethoscope class="w-4 h-4 text-teal-600" />
          内镜报告调阅流程
        </h3>

        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="p-3 bg-slate-50 rounded-2xl space-y-1">
            <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center mx-auto">
              1
            </div>
            <p class="font-bold text-slate-800 text-[11px]">完成检查</p>
            <p class="text-[9px] text-slate-400">医生实时采集上传</p>
          </div>

          <div class="p-3 bg-slate-50 rounded-2xl space-y-1">
            <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center mx-auto">
              2
            </div>
            <p class="font-bold text-slate-800 text-[11px]">输入身份证</p>
            <p class="text-[9px] text-slate-400">安全脱敏精准验证</p>
          </div>

          <div class="p-3 bg-slate-50 rounded-2xl space-y-1">
            <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center mx-auto">
              3
            </div>
            <p class="font-bold text-slate-800 text-[11px]">导出报告</p>
            <p class="text-[9px] text-slate-400">一键保存高清 PDF</p>
          </div>
        </div>

        <div class="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 text-teal-800 text-[11px] leading-relaxed flex items-center space-x-2">
          <ShieldCheck class="w-4 h-4 text-teal-600 shrink-0" />
          <span>本平台严格遵循医疗数据安全规范，所有图像与诊断信息均经过数字验真与加密保护。</span>
        </div>
      </div>
    </div>
  </div>
</template>
