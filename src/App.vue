<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PatientRecord } from './types';
import { fetchAllRecords, saveRecord, deleteRecord, resetDemo } from './api';
import Header from './components/Header.vue';
import DoctorPortal from './components/doctor/DoctorPortal.vue';
import PatientPortal from './components/patient/PatientPortal.vue';
import ReportView from './components/patient/ReportView.vue';
import { Stethoscope, UserCheck } from 'lucide-vue-next';

// 根据 URL 参数或默认状态独立医生端与患者端 (e.g. ?role=doctor)
const activeMode = ref<'doctor' | 'patient'>('patient');
const records = ref<PatientRecord[]>([]);

// 医生端点击“查看报告”时查看选中的记录
const viewingDoctorRecord = ref<PatientRecord | null>(null);

function initModeFromURL() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role');
  if (role === 'doctor') {
    activeMode.value = 'doctor';
  } else {
    activeMode.value = 'patient';
  }
}

function switchMode(mode: 'doctor' | 'patient') {
  activeMode.value = mode;
  viewingDoctorRecord.value = null;
  const url = new URL(window.location.href);
  url.searchParams.set('role', mode);
  window.history.pushState({}, '', url.toString());
}

async function refreshRecords() {
  records.value = await fetchAllRecords();
}

async function handleSaveRecord(record: PatientRecord) {
  records.value = await saveRecord(record);
}

async function handleDeleteRecord(id: string) {
  if (confirm('确定要删除这份内镜检查记录及其关联的所有图片吗？')) {
    records.value = await deleteRecord(id);
    if (viewingDoctorRecord.value?.id === id) {
      viewingDoctorRecord.value = null;
    }
  }
}

async function handleResetDemo() {
  if (confirm('确定要重置并恢复内置的示范检查报告与图像数据吗？')) {
    records.value = await resetDemo();
    viewingDoctorRecord.value = null;
  }
}

onMounted(() => {
  initModeFromURL();
  refreshRecords();
});
</script>

<template>
  <!-- 微信小程序独立端口容器 (WeChat Mini-Program Separated Portal Layout) -->
  <div class="min-h-screen bg-slate-100 flex flex-col justify-start items-center font-sans antialiased text-slate-800 selection:bg-teal-500 selection:text-white">
    <div class="w-full max-w-md bg-slate-50 min-h-screen shadow-md sm:border-x sm:border-slate-200/80 flex flex-col relative">
      <!-- 微信小程序 Header 导航栏 -->
      <Header
        :activeMode="activeMode"
        @resetDemo="handleResetDemo"
      />

      <!-- 主视图区域 -->
      <main class="flex-1 p-3.5 space-y-4">
        <!-- 端口 1: 医生端工作台 (Doctor Portal) -->
        <template v-if="activeMode === 'doctor'">
          <ReportView
            v-if="viewingDoctorRecord"
            :record="viewingDoctorRecord"
            @back="viewingDoctorRecord = null"
          />

          <DoctorPortal
            v-else
            :records="records"
            @saveRecord="handleSaveRecord"
            @deleteRecord="handleDeleteRecord"
            @viewRecord="(r) => viewingDoctorRecord = r"
          />
        </template>

        <!-- 端口 2: 患者端查询入口 (Patient Portal) -->
        <template v-else>
          <PatientPortal />
        </template>
      </main>

      <!-- 小程序底部独立入口说明与角色隔离链接 -->
      <footer class="no-print text-center pt-4 pb-24 px-3 text-xs text-slate-400 border-t border-slate-200/60 bg-white space-y-2">
        <p>© 2026 智慧医疗内镜云平台</p>
        
        <!-- 独立端口切换链接 -->
        <div class="pt-1">
          <button
            v-if="activeMode === 'patient'"
            @click="switchMode('doctor')"
            class="inline-flex items-center space-x-1 text-[11px] text-slate-400 hover:text-teal-600 transition underline decoration-dotted"
          >
            <Stethoscope class="w-3.5 h-3.5" />
            <span>医务人员工作台入口 &rarr;</span>
          </button>

          <button
            v-else
            @click="switchMode('patient')"
            class="inline-flex items-center space-x-1 text-[11px] text-teal-600 hover:text-teal-700 font-medium transition underline"
          >
            <UserCheck class="w-3.5 h-3.5" />
            <span>&larr; 返回患者查询入口</span>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>
