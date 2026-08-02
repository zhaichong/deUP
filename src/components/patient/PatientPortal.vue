<script setup lang="ts">
import { ref } from 'vue';
import type { PatientRecord } from '../../types';
import { queryRecordsByIdCard } from '../../api';
import { validateIdCard } from '../../utils/validators';
import ReportView from './ReportView.vue';
import { Search, CreditCard, ShieldCheck, AlertCircle, FileText, Sparkles, HeartPulse, History } from 'lucide-vue-next';

const idCardInput = ref('');
const searchedRecords = ref<PatientRecord[] | null>(null);
const selectedRecord = ref<PatientRecord | null>(null);
const isSearching = ref(false);
const errorMessage = ref('');

// 搜索历史记录
const recentSearches = ref<string[]>(['110101197405122334']);

async function handleSearch(targetId?: string) {
  const target = targetId || idCardInput.value.trim().toUpperCase();
  errorMessage.value = '';

  if (!target) {
    errorMessage.value = '请输入您的身份证号码';
    return;
  }

  const check = validateIdCard(target);
  if (!check.valid) {
    errorMessage.value = check.message || '请输入有效的身份证号码';
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

    // 保存到历史搜索
    if (!recentSearches.value.includes(target)) {
      recentSearches.value.unshift(target);
      if (recentSearches.value.length > 3) recentSearches.value.pop();
    }
  } catch (err) {
    errorMessage.value = '查询失败，请稍后重试';
  } finally {
    isSearching.value = false;
  }
}

function handleDemoClick() {
  handleSearch('110101197405122334');
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
    <!-- 详情视图 (如果患者选中了一条报告) -->
    <ReportView
      v-if="selectedRecord"
      :record="selectedRecord"
      @back="selectedRecord = null"
    />

    <!-- 患者搜索与结果卡片 -->
    <div v-else class="space-y-4">
      <!-- 极简亲和的患者专属 Header Banner -->
      <div class="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="flex items-center space-x-3 mb-2">
          <div class="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-sm">
            <HeartPulse class="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 class="text-xl font-bold">患者内镜报告调阅</h2>
            <p class="text-xs text-emerald-100/90">免去排队领报告，随时随地查阅影像</p>
          </div>
        </div>
        <p class="text-xs text-emerald-50 leading-relaxed mt-2 bg-black/10 p-2.5 rounded-2xl border border-white/10">
          隐私安全保护：无需繁琐账号登录，凭本人**身份证号码**即可精准调阅内镜检查图像及诊断意见。
        </p>
      </div>

      <!-- 极简单框查询卡片 -->
      <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CreditCard class="w-4 h-4 text-emerald-600" />
            身份证调阅入口
          </span>
          <span class="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" /> 256-bit 加密保护
          </span>
        </div>

        <!-- 报错提示 -->
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-600 rounded-2xl text-xs flex items-center space-x-2 border border-red-200">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleSearch()" class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">请输入身份证号码</label>
            <div class="relative">
              <input
                v-model="idCardInput"
                type="text"
                maxlength="18"
                placeholder="请输入18位身份证号 (例如 110101197405122334)"
                class="w-full pl-3.5 pr-10 py-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-mono text-slate-900 font-bold tracking-wider"
              />
              <button
                v-if="idCardInput"
                type="button"
                @click="idCardInput = ''"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                &times;
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isSearching"
            class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs transition shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2 active:scale-98"
          >
            <Search class="w-4 h-4 stroke-[2.5]" />
            <span>{{ isSearching ? '正在调阅中...' : '立即查询内镜报告' }}</span>
          </button>
        </form>

        <!-- 快捷测试示例 -->
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-400 text-[11px] flex items-center gap-1">
            <History class="w-3.5 h-3.5 text-slate-400" /> 快捷体验测试：
          </span>
          <button
            type="button"
            @click="handleDemoClick"
            class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition text-[11px] font-mono flex items-center gap-1"
          >
            <Sparkles class="w-3 h-3 text-amber-500" /> 自动填入测试身份证号
          </button>
        </div>
      </div>

      <!-- 查询结果区域 -->
      <div v-if="searchedRecords !== null" class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-800">
            查询结果 (找到 {{ searchedRecords.length }} 份报告)
          </h3>
          <button @click="resetSearch" class="text-xs text-slate-400 hover:text-slate-600 underline">
            重新查询
          </button>
        </div>

        <div v-if="searchedRecords.length === 0" class="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <FileText class="w-10 h-10 text-slate-300 mx-auto" />
          <p class="text-xs text-slate-500 font-bold">未查询到该身份证号的内镜检查报告</p>
          <p class="text-[11px] text-slate-400">请核对输入的身份证号码是否正确，或联系接诊医师发布报告。</p>
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="rec in searchedRecords"
            :key="rec.id"
            @click="selectedRecord = rec"
            class="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-emerald-500 transition cursor-pointer flex items-center justify-between group active:scale-98"
          >
            <div class="space-y-1">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-bold text-slate-900">{{ rec.examType }}</span>
                <span class="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-medium rounded-full border border-emerald-200">
                  已出报告
                </span>
              </div>
              <p class="text-[11px] text-slate-500 font-mono">检查日期: {{ rec.examDate }}</p>
              <p class="text-[11px] text-slate-600 line-clamp-1">诊断: {{ rec.diagnosis }}</p>
            </div>

            <div class="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition flex items-center gap-1 shrink-0">
              查看详情 &rarr;
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
