<script setup lang="ts">
import { ref } from 'vue';
import { registerDoctor, type DoctorSession } from '../../api';
import { UserPlus, X, Check, AlertCircle, User, Lock, Building } from 'lucide-vue-next';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', newDoctor: DoctorSession): void;
}>();

const username = ref('');
const password = ref('');
const name = ref('');
const title = ref('医师');
const department = ref('脾胃病科（消化内镜室）');

const errorMessage = ref('');
const isLoading = ref(false);

async function handleSubmit() {
  errorMessage.value = '';

  if (!username.value.trim() || !password.value || !name.value.trim()) {
    errorMessage.value = '用户名、密码与医生姓名均为必填项';
    return;
  }

  isLoading.value = true;
  try {
    const newDoc = await registerDoctor({
      username: username.value,
      password: password.value,
      name: name.value,
      title: title.value,
      department: department.value,
      role: 'doctor'
    });

    emit('created', newDoc);
    emit('close');

    // 重置表单
    username.value = '';
    password.value = '';
    name.value = '';
  } catch (err: any) {
    errorMessage.value = err.message || '创建医生账号失败';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-5 shadow-2xl max-w-sm w-full space-y-4 border border-slate-100 relative">
        <!-- 弹窗 Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <UserPlus class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">管理员添加新医生账号</h3>
              <p class="text-[10px] text-slate-400">设置医生登录名与科室身份</p>
            </div>
          </div>

          <button @click="emit('close')" class="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 报错提示 -->
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center space-x-2 border border-red-200">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- 创建医生表单 -->
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User class="w-3.5 h-3.5 text-teal-600" /> 医生登录用户名 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="username"
              type="text"
              placeholder="自定义账号 (例如 zhang_doc)"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Lock class="w-3.5 h-3.5 text-teal-600" /> 初始登录密码 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="password"
              type="password"
              placeholder="设置初始密码"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1">医生真实姓名 <span class="text-red-500">*</span></label>
              <input
                v-model="name"
                type="text"
                placeholder="例如: 张敏"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1">职称</label>
              <input
                v-model="title"
                type="text"
                placeholder="例如: 副主任医师"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building class="w-3.5 h-3.5 text-teal-600" /> 所属科室
            </label>
            <input
              v-model="department"
              type="text"
              placeholder="例如: 脾胃病科（消化内镜室）"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div class="pt-2 flex items-center space-x-2">
            <button
              type="button"
              @click="emit('close')"
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-[2] py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-1"
            >
              <Check class="w-4 h-4" />
              <span>{{ isLoading ? '创建中...' : '确认创建账号' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
