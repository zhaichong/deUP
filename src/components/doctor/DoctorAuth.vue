<script setup lang="ts">
import { ref } from 'vue';
import { loginDoctor, type DoctorSession } from '../../api';
import { Stethoscope, Lock, User, LogIn, AlertCircle, Sparkles, ShieldCheck } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'loginSuccess', session: DoctorSession): void;
}>();

// 登录响应式状态
const loginUsername = ref('');
const loginPassword = ref('');

const errorMessage = ref('');
const isLoading = ref(false);

async function handleLogin() {
  errorMessage.value = '';

  if (!loginUsername.value.trim() || !loginPassword.value) {
    errorMessage.value = '请输入用户名和密码';
    return;
  }

  isLoading.value = true;
  try {
    const session = await loginDoctor(loginUsername.value, loginPassword.value);
    emit('loginSuccess', session);
  } catch (err: any) {
    errorMessage.value = err.message || '登录失败';
  } finally {
    isLoading.value = false;
  }
}

// 快捷填入示范医生账号
function fillDoctorAccount() {
  loginUsername.value = 'doctor';
  loginPassword.value = '123456';
  handleLogin();
}
</script>

<template>
  <div class="max-w-md mx-auto space-y-4 pt-2">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-sm relative overflow-hidden">
      <div class="flex items-center space-x-3 mb-2">
        <div class="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-200">
          <Stethoscope class="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h2 class="text-base font-bold">智慧医疗内镜中心</h2>
          <p class="text-xs text-teal-100/80">消化内镜室 · 医务人员工作台</p>
        </div>
      </div>
      <p class="text-xs text-teal-100/70 leading-relaxed mt-2">
        请输入医务人员工作账号与密码；新医生账号由管理员在系统内部添加。
      </p>
    </div>

    <!-- 登录主体卡片 -->
    <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
      <div class="flex items-center space-x-2 text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
        <ShieldCheck class="w-4 h-4 text-teal-600" />
        <span>医务人员身份验证</span>
      </div>

      <!-- 报错提示 -->
      <div v-if="errorMessage" class="p-3 bg-red-50 text-red-600 rounded-2xl text-xs flex items-center space-x-2 border border-red-100">
        <AlertCircle class="w-4 h-4 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <User class="w-3.5 h-3.5 text-teal-600" /> 用户名
          </label>
          <input
            v-model="loginUsername"
            type="text"
            placeholder="请输入账号 (如 doctor)"
            class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium text-slate-800"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Lock class="w-3.5 h-3.5 text-teal-600" /> 密码
          </label>
          <input
            v-model="loginPassword"
            type="password"
            placeholder="请输入密码"
            class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium text-slate-800"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5 active:scale-98"
        >
          <LogIn class="w-4 h-4" />
          <span>{{ isLoading ? '验证中...' : '登录工作台' }}</span>
        </button>

        <!-- 演示账号快捷选项 (仅保留普通医生示范账号) -->
        <div class="pt-3 border-t border-slate-100 text-xs space-y-2">
          <div class="flex items-center space-x-1 font-bold text-slate-700">
            <Sparkles class="w-3.5 h-3.5 text-amber-500" /> 快捷体验测试账号：
          </div>

          <div>
            <button
              type="button"
              @click="fillDoctorAccount"
              class="w-full p-2.5 bg-teal-50/80 hover:bg-teal-100 text-teal-900 rounded-xl border border-teal-200/60 transition text-[11px] flex items-center justify-between font-medium"
            >
              <span class="font-bold flex items-center gap-1">
                <User class="w-3.5 h-3.5 text-teal-600" /> 示范医生体验账号
              </span>
              <span class="font-mono text-slate-500">doctor / 123456</span>
            </button>
          </div>
          
          <p class="text-[10px] text-slate-400 text-center pt-1">
            提示：管理员账号属于系统管理权限，不公开提供快捷点击按钮。
          </p>
        </div>
      </form>
    </div>
  </div>
</template>
