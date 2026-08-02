<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PatientRecord } from '../../types';
import { getCurrentDoctor, logoutDoctor, type DoctorSession } from '../../api';
import DoctorAuth from './DoctorAuth.vue';
import AdminDoctorManager from './AdminDoctorManager.vue';
import UploadForm from './UploadForm.vue';
import RecordList from './RecordList.vue';
import { Camera, FileText, UserCheck, LogOut, Users } from 'lucide-vue-next';

const props = defineProps<{
  records: PatientRecord[];
}>();

const emit = defineEmits<{
  (e: 'saveRecord', record: PatientRecord): void;
  (e: 'deleteRecord', id: string): void;
  (e: 'viewRecord', record: PatientRecord): void;
}>();

const currentDoctor = ref<DoctorSession | null>(null);
const activeTab = ref<'upload' | 'list'>('upload');

// 管理员管理医生 Modal 弹窗
const showDoctorManagerModal = ref(false);

function checkAuth() {
  currentDoctor.value = getCurrentDoctor();
}

function handleLoginSuccess(session: DoctorSession) {
  currentDoctor.value = session;
  activeTab.value = 'upload';
}

function handleLogout() {
  if (confirm('确定要退出当前工作台登录吗？')) {
    logoutDoctor();
    currentDoctor.value = null;
  }
}

function handleSave(record: PatientRecord) {
  emit('saveRecord', record);
  activeTab.value = 'list';
}

function handleView(record: PatientRecord) {
  emit('viewRecord', record);
}

onMounted(() => {
  checkAuth();
});
</script>

<template>
  <div>
    <!-- 情况一: 未登录时，渲染统一医务/管理员登录卡片 -->
    <DoctorAuth
      v-if="!currentDoctor"
      @loginSuccess="handleLoginSuccess"
    />

    <!-- 情况二: 已登录状态，展示工作台 -->
    <div v-else class="pb-24 space-y-3">
      <!-- 医生 / 管理员已登录状态栏 -->
      <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
            :class="[currentDoctor.role === 'admin' ? 'bg-cyan-100 text-cyan-800' : 'bg-teal-100 text-teal-700']"
          >
            <UserCheck class="w-4 h-4" />
          </div>
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-bold text-slate-900">{{ currentDoctor.name }}</span>
              <span
                class="text-[10px] px-1.5 py-0.2 font-medium rounded border"
                :class="[
                  currentDoctor.role === 'admin'
                    ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                    : 'bg-teal-50 text-teal-700 border-teal-200'
                ]"
              >
                {{ currentDoctor.role === 'admin' ? '系统管理员' : currentDoctor.title }}
              </span>
            </div>
            <p class="text-[10px] text-slate-400 font-mono">{{ currentDoctor.department }} (@{{ currentDoctor.username }})</p>
          </div>
        </div>

        <div class="flex items-center space-x-1.5">
          <!-- 只有管理员登录后，才会显示“医生账号管理”特权按钮 -->
          <button
            v-if="currentDoctor.role === 'admin'"
            @click="showDoctorManagerModal = true"
            class="flex items-center space-x-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-[11px] font-bold shadow-sm transition active:scale-95"
            title="管理员特权：添加与修改医生账号"
          >
            <Users class="w-3.5 h-3.5" />
            <span>账号管理</span>
          </button>

          <button
            @click="handleLogout"
            class="flex items-center space-x-1 px-2 py-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-[11px] font-medium transition"
            title="退出登录"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>退出</span>
          </button>
        </div>
      </div>

      <!-- 视图 1: 手机端拍照录入表单 -->
      <UploadForm
        v-if="activeTab === 'upload'"
        :currentDoctor="currentDoctor"
        @save="handleSave"
        @cancel="activeTab = 'list'"
      />

      <!-- 视图 2: 已录入报告列表 -->
      <RecordList
        v-else
        :records="records"
        @view="handleView"
        @delete="emit('deleteRecord', $event)"
        @createNew="activeTab = 'upload'"
      />

      <!-- 微信小程序风格底部固定 TabBar -->
      <div class="no-print fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 grid grid-cols-2 z-40 shadow-lg">
        <button
          @click="activeTab = 'upload'"
          class="py-2 flex flex-col items-center justify-center transition font-sans text-[11px]"
          :class="[activeTab === 'upload' ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-600']"
        >
          <Camera class="w-5 h-5 mb-0.5" :class="[activeTab === 'upload' ? 'stroke-[2.5]' : 'stroke-[1.8]']" />
          <span>拍摄上传</span>
        </button>

        <button
          @click="activeTab = 'list'"
          class="py-2 flex flex-col items-center justify-center transition font-sans text-[11px]"
          :class="[activeTab === 'list' ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-600']"
        >
          <FileText class="w-5 h-5 mb-0.5" :class="[activeTab === 'list' ? 'stroke-[2.5]' : 'stroke-[1.8]']" />
          <span>报告管理 ({{ records.length }})</span>
        </button>
      </div>
    </div>

    <!-- 管理员医生账号管理 Modal 弹窗 -->
    <AdminDoctorManager
      :show="showDoctorManagerModal"
      @close="showDoctorManagerModal = false"
    />
  </div>
</template>
