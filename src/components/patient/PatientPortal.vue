<script setup lang="ts">
import { ref } from 'vue';
import type { PatientRecord } from '../../types';
import { queryRecordsByIdCard } from '../../api';
import { validateIdCard } from '../../utils/validators';
import ReportView from './ReportView.vue';
import {
  Search,
  ShieldCheck,
  AlertCircle,
  FileText,
  Sparkles,
  Zap,
  Lock,
  FileDown,
  ArrowRight,
  ChevronRight,
  HeartPulse,
  Activity,
  CheckCircle2,
  Calendar,
  User,
  Building2
} from 'lucide-vue-next';

const idCardInput = ref('');
const searchedRecords = ref<PatientRecord[] | null>(null);
const selectedRecord = ref<PatientRecord | null>(null);
const isSearching = ref(false);
const errorMessage = ref('');

// 演示测试身份证号
const DEMO_ID_CARD = '110101197405122334';

async function handleSearch(targetId?: string) {
  const target = targetId || idCardInput.value.trim().toUpperCase();
  errorMessage.value = '';

  if (!target) {
    errorMessage.value = '请输入您的身份证号码以调阅报告';
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
  } catch (err) {
    errorMessage.value = '云端数据库连接超时，请重试';
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
  <div class="space-y-5">
    <!-- 详情视图 (如果患者选中了一份报告单) -->
    <ReportView
      v-if="selectedRecord"
      :record="selectedRecord"
      @back="selectedRecord = null"
    />

    <!-- 患者专属 UI 主界面 -->
    <div v-else class="space-y-5">
      <!-- 1. 顶奢级医用 Hero Banner 品牌头部卡片 -->
      <div class="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-teal-900/20 overflow-hidden border border-teal-500/20">
        <!-- 背景医用艺术几何与流光光晕 -->
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute right-12 top-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl pointer-events-none"></div>
        
        <div class="relative z-10 space-y-4">
          <!-- 标签标语与安全认证 -->
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wide text-emerald-100 border border-white/20">
              <HeartPulse class="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>智慧医疗 · 电子内镜中心</span>
            </span>

            <span class="inline-flex items-center space-x-1 text-[10px] text-teal-200/90 font-mono">
              <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
              <span>三级加密防伪认证</span>
            </span>
          </div>

          <!-- 主标题与问候 -->
          <div>
            <h1 class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              查阅您的内镜检查报告
            </h1>
            <p class="text-xs text-emerald-100/80 mt-1 leading-relaxed font-normal">
              无需前往医院排队，凭本人身份证号即可实时在线调阅高清图像与医生诊断结论。
            </p>
          </div>
        </div>
      </div>

      <!-- 2. 悬浮精致搜索卡片 (Elevated Floating Search Card) -->
      <div class="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-md shadow-slate-200/50 space-y-4 relative">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Activity class="w-4 h-4 text-emerald-600" />
            患者调阅验证
          </h2>
          <span class="text-[10px] text-slate-400">请输入18位身份证号</span>
        </div>

        <!-- 报错提示 -->
        <div v-if="errorMessage" class="p-3.5 bg-red-50 text-red-600 rounded-2xl text-xs flex items-center space-x-2 border border-red-200 animate-fade-in">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span class="font-medium">{{ errorMessage }}</span>
        </div>

        <!-- 搜索表单 -->
        <form @submit.prevent="handleSearch()" class="space-y-3.5">
          <div class="relative group">
            <input
              v-model="idCardInput"
              type="text"
              maxlength="18"
              placeholder="请输入身份证号码 (如 110101197405122334)"
              class="w-full pl-4 pr-12 py-3.5 text-xs uppercase bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none font-mono text-slate-900 font-bold tracking-wider transition-all"
            />
            
            <button
              v-if="idCardInput"
              type="button"
              @click="idCardInput = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 text-xs flex items-center justify-center transition"
            >
              &times;
            </button>
          </div>

          <button
            type="submit"
            :disabled="isSearching"
            class="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-75"
          >
            <Search class="w-4 h-4 stroke-[2.5]" />
            <span>{{ isSearching ? '正在加密调阅报告中...' : '立即调阅内镜电子报告' }}</span>
          </button>
        </form>

        <!-- 快速示范点击组件 -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-400 text-[11px]">没有身份证号？使用示例试用:</span>
          <button
            type="button"
            @click="handleDemoClick"
            class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200/80 transition text-[11px] font-medium flex items-center space-x-1 active:scale-95"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-500" />
            <span>自动填入测试示范账号</span>
          </button>
        </div>
      </div>

      <!-- 3. 三大核心权益特色与保障图标区 (Feature Advantages Grid) -->
      <div class="grid grid-cols-3 gap-2.5">
        <div class="p-3 bg-white/80 rounded-2xl border border-slate-200/60 shadow-2xs text-center space-y-1">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Zap class="w-4 h-4" />
          </div>
          <h4 class="text-[11px] font-bold text-slate-800">秒级响应</h4>
          <p class="text-[9px] text-slate-400">高清图像秒级加载</p>
        </div>

        <div class="p-3 bg-white/80 rounded-2xl border border-slate-200/60 shadow-2xs text-center space-y-1">
          <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Lock class="w-4 h-4" />
          </div>
          <h4 class="text-[11px] font-bold text-slate-800">隐私保护</h4>
          <p class="text-[9px] text-slate-400">身份证脱敏验真</p>
        </div>

        <div class="p-3 bg-white/80 rounded-2xl border border-slate-200/60 shadow-2xs text-center space-y-1">
          <div class="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
            <FileDown class="w-4 h-4" />
          </div>
          <h4 class="text-[11px] font-bold text-slate-800">PDF 导出</h4>
          <p class="text-[9px] text-slate-400">支持一键保存打印</p>
        </div>
      </div>

      <!-- 4. 查询结果列表展示 (Query Result Cards) -->
      <div v-if="searchedRecords !== null" class="space-y-3 pt-2">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center space-x-2">
            <h3 class="text-xs font-bold text-slate-900">查询结果列表</h3>
            <span class="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-mono font-bold">
              {{ searchedRecords.length }} 份
            </span>
          </div>
          <button @click="resetSearch" class="text-xs text-slate-400 hover:text-slate-600 underline">
            重新输入
          </button>
        </div>

        <!-- 结果为空时的优雅缺省图 -->
        <div v-if="searchedRecords.length === 0" class="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-2xs">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText class="w-6 h-6" />
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800">未找到相关检查报告</h4>
            <p class="text-[11px] text-slate-400 mt-1">请检查身份证号是否正确，或稍后刷新重试</p>
          </div>
        </div>

        <!-- 找到报告列表卡片 -->
        <div v-else class="space-y-3">
          <div
            v-for="rec in searchedRecords"
            :key="rec.id"
            @click="selectedRecord = rec"
            class="group bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer space-y-3 relative overflow-hidden active:scale-98"
          >
            <!-- 卡片顶部类别标 -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="text-xs font-bold text-slate-900">{{ rec.examType }}</span>
              </div>
              <span class="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200/80 flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3 text-emerald-600" /> 已发布
              </span>
            </div>

            <!-- 卡片中间关键信息 -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex items-center space-x-1.5 text-slate-600">
                <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span class="font-mono">{{ rec.examDate }}</span>
              </div>
              <div class="flex items-center space-x-1.5 text-slate-600">
                <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{{ rec.doctorName }}</span>
              </div>
            </div>

            <div class="p-2.5 bg-slate-50 rounded-2xl text-xs text-slate-700 font-medium line-clamp-2">
              <span class="text-emerald-700 font-bold">诊断结论：</span>{{ rec.diagnosis }}
            </div>

            <!-- 卡片底部 action 提示条 -->
            <div class="flex items-center justify-between text-xs pt-1">
              <span class="text-[10px] text-slate-400">包含 {{ rec.images.length }} 张高清病灶图像</span>
              <span class="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                调阅完整报告与 PDF 导出 <ChevronRight class="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
