<script setup lang="ts">
import { ref } from 'vue';
import type { PatientRecord } from '../../types';
import { queryRecordsByIdCard } from '../../api';
import { validateIdCard } from '../../utils/validators';
import ReportView from './ReportView.vue';
import { Search, CreditCard, ShieldCheck, AlertCircle, FileSearch, Sparkles, Loader2 } from 'lucide-vue-next';

const queryInput = ref('');
const errorMessage = ref('');
const hasSearched = ref(false);
const isLoading = ref(false);

const foundRecords = ref<PatientRecord[]>([]);
const selectedRecord = ref<PatientRecord | null>(null);

async function handleSearch() {
  errorMessage.value = '';
  hasSearched.value = false;
  selectedRecord.value = null;

  const raw = queryInput.value.trim();
  if (!raw) {
    errorMessage.value = '请输入您的18位居民身份证号码';
    return;
  }

  // 身份证格式加权校验
  const check = validateIdCard(raw);
  if (!check.valid) {
    errorMessage.value = check.message || '身份证号格式不正确';
    return;
  }

  isLoading.value = true;
  try {
    // 从后端 API / 数据库拉取该身份证号的全部报告
    const results = await queryRecordsByIdCard(raw);
    foundRecords.value = results;
    hasSearched.value = true;

    if (results.length === 1) {
      selectedRecord.value = results[0];
    }
  } catch (err) {
    errorMessage.value = '查询服务器失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
}

// 快捷选择测试示例身份证
function fillDemoIdCard() {
  queryInput.value = '110101197405122334';
  handleSearch();
}
</script>

<template>
  <div class="space-y-4">
    <!-- 如果已选中具体报告，渲染报告单页面 -->
    <ReportView
      v-if="selectedRecord"
      :record="selectedRecord"
      @back="selectedRecord = null"
    />

    <!-- 患者查询入口面板 -->
    <div v-else class="space-y-4 max-w-xl mx-auto">
      <!-- 患者查询 Header Banner -->
      <div class="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="relative z-10 space-y-2">
          <div class="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-medium text-teal-200">
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>患者隐私安全加密调阅</span>
          </div>
          <h2 class="text-xl font-bold tracking-tight">内镜检查报告与影像查询</h2>
          <p class="text-xs text-teal-100/80 leading-relaxed">
            请输入您的 **18位居民身份证号码**，在线实时调阅您的内镜检查报告与高清图像。
          </p>
        </div>
      </div>

      <!-- 查询卡片主体 -->
      <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <!-- 身份证查询输入框 -->
        <form @submit.prevent="handleSearch" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <CreditCard class="w-4 h-4 text-teal-600" />
              18位居民身份证号码
            </label>

            <div class="relative">
              <input
                v-model="queryInput"
                type="text"
                maxlength="18"
                placeholder="请输入您的18位身份证号"
                class="w-full px-4 py-3 text-sm bg-slate-50 border rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono uppercase shadow-inner"
                :class="[errorMessage ? 'border-red-300 bg-red-50/50' : 'border-slate-200']"
              />
            </div>

            <!-- 错误提示 -->
            <p v-if="errorMessage" class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" />
              <span>{{ errorMessage }}</span>
            </p>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-teal-600/25 flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-75"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            <Search v-else class="w-4 h-4 stroke-[2.5]" />
            <span>{{ isLoading ? '正在查询服务器数据库...' : '查询内镜报告' }}</span>
          </button>
        </form>

        <!-- 快速体验示例系统按键 -->
        <div class="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
          <div class="flex items-center space-x-1 font-bold text-teal-900">
            <Sparkles class="w-3.5 h-3.5 text-amber-500" />
            <span>测试快捷体验：</span>
          </div>
          <button
            @click="fillDemoIdCard"
            class="w-full p-2.5 bg-teal-50/80 hover:bg-teal-100 text-teal-800 rounded-xl text-left border border-teal-200/60 transition text-xs flex items-center justify-between"
          >
            <span class="font-bold">一键填入测试身份证</span>
            <span class="font-mono text-slate-500">110101197405122334</span>
          </button>
        </div>
      </div>

      <!-- 搜索结果列表 -->
      <div v-if="hasSearched && !selectedRecord" class="space-y-3 pt-2">
        <div v-if="foundRecords.length === 0" class="bg-white rounded-3xl p-6 text-center border border-slate-200/80 space-y-2">
          <FileSearch class="w-10 h-10 text-slate-300 mx-auto" />
          <p class="text-xs font-bold text-slate-700">未查询到对应的内镜检查记录</p>
          <p class="text-[11px] text-slate-400">请核对您输入的身份证号是否正确</p>
        </div>

        <div v-else class="space-y-2">
          <p class="text-xs font-bold text-slate-700 px-1">共查询到 {{ foundRecords.length }} 份报告，点击查看：</p>
          <div
            v-for="rec in foundRecords"
            :key="rec.id"
            @click="selectedRecord = rec"
            class="bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-500 shadow-sm cursor-pointer transition flex items-center justify-between group"
          >
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-bold text-slate-900">内镜检查报告</span>
                <span class="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 font-bold rounded-full border border-teal-200">
                  {{ rec.examType }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1">检查日期: {{ rec.examDate }} | 医生: {{ rec.doctorName }}</p>
            </div>

            <span class="text-xs text-teal-600 font-bold group-hover:underline flex items-center gap-0.5">
              调阅报告 &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
