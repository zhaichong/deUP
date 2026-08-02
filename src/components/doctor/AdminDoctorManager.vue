<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchDoctorsList, updateDoctor, registerDoctor, type DoctorSession } from '../../api';
import { Users, UserPlus, Edit3, X, Check, Lock, User, Building, ShieldCheck, Sparkles } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const doctors = ref<DoctorSession[]>([]);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// 视图模式: 'list' | 'add' | 'edit'
const viewMode = ref<'list' | 'add' | 'edit'>('list');
const editingDoctorId = ref('');

// 表单响应式字段
const formUsername = ref('');
const formPassword = ref('');
const formName = ref('');
const formTitle = ref('医师');
const formDepartment = ref('脾胃病科（消化内镜室）');

async function loadDoctors() {
  isLoading.value = true;
  try {
    doctors.value = await fetchDoctorsList();
  } catch (err) {
    console.error('加载医生账号列表失败');
  } finally {
    isLoading.value = false;
  }
}

function openAddModal() {
  viewMode.value = 'add';
  formUsername.value = '';
  formPassword.value = '';
  formName.value = '';
  formTitle.value = '医师';
  formDepartment.value = '脾胃病科（消化内镜室）';
  errorMessage.value = '';
  successMessage.value = '';
}

function openEditModal(doc: DoctorSession) {
  viewMode.value = 'edit';
  editingDoctorId.value = doc.id;
  formUsername.value = doc.username;
  formPassword.value = ''; // 留空不修改
  formName.value = doc.name;
  formTitle.value = doc.title || '医师';
  formDepartment.value = doc.department || '脾胃病科（消化内镜室）';
  errorMessage.value = '';
  successMessage.value = '';
}

async function handleSaveDoctor() {
  errorMessage.value = '';
  successMessage.value = '';

  if (viewMode.value === 'add') {
    if (!formUsername.value.trim() || !formPassword.value || !formName.value.trim()) {
      errorMessage.value = '用户名、密码与医生姓名均为必填项';
      return;
    }

    try {
      await registerDoctor({
        username: formUsername.value,
        password: formPassword.value,
        name: formName.value,
        title: formTitle.value,
        department: formDepartment.value,
        role: 'doctor'
      });

      successMessage.value = `成功创建新医生账号【${formName.value}】！`;
      await loadDoctors();
      setTimeout(() => { viewMode.value = 'list'; }, 800);
    } catch (err: any) {
      errorMessage.value = err.message || '添加失败';
    }
  } else if (viewMode.value === 'edit') {
    if (!formName.value.trim()) {
      errorMessage.value = '医生姓名不能为空';
      return;
    }

    try {
      await updateDoctor(editingDoctorId.value, {
        name: formName.value,
        title: formTitle.value,
        department: formDepartment.value,
        password: formPassword.value ? formPassword.value : undefined
      });

      successMessage.value = `成功修改【${formName.value}】的账号资料！`;
      await loadDoctors();
      setTimeout(() => { viewMode.value = 'list'; }, 800);
    } catch (err: any) {
      errorMessage.value = err.message || '修改失败';
    }
  }
}

onMounted(() => {
  if (props.show) loadDoctors();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-5 shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col space-y-4 border border-slate-100 relative">
        <!-- 弹窗 Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Users class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">科室医生账号管理中心</h3>
              <p class="text-[10px] text-slate-400">管理、添加与修改科室医生账号资料</p>
            </div>
          </div>

          <button @click="emit('close')" class="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 提示信息 Toast -->
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center space-x-2 border border-red-200 shrink-0">
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="p-3 bg-teal-50 text-teal-700 rounded-xl text-xs flex items-center space-x-2 border border-teal-200 shrink-0">
          <span>{{ successMessage }}</span>
        </div>

        <!-- 视图 1: 医生账号列表 (List Mode) -->
        <div v-if="viewMode === 'list'" class="flex-1 overflow-y-auto space-y-3 pr-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700">全部医务人员 ({{ doctors.length }})</span>
            <button
              @click="openAddModal"
              class="flex items-center space-x-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span>添加新医生</span>
            </button>
          </div>

          <div v-if="isLoading" class="text-center py-6 text-xs text-slate-400">加载中...</div>

          <div v-else class="space-y-2.5">
            <div
              v-for="doc in doctors"
              :key="doc.id"
              class="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between hover:bg-slate-100/60 transition"
            >
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-bold text-slate-900">{{ doc.name }}</span>
                  <span class="text-[10px] px-1.5 py-0.2 bg-teal-50 text-teal-700 rounded border border-teal-200 font-medium">
                    {{ doc.title || '医师' }}
                  </span>
                  <span v-if="doc.role === 'admin'" class="text-[10px] px-1.5 py-0.2 bg-cyan-100 text-cyan-800 rounded font-bold">
                    管理员
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 flex items-center space-x-2 font-mono">
                  <span>账号: @{{ doc.username }}</span>
                  <span>·</span>
                  <span>{{ doc.department }}</span>
                </div>
              </div>

              <button
                @click="openEditModal(doc)"
                class="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-700 border border-slate-200 hover:border-teal-300 rounded-xl text-xs font-medium transition active:scale-95 shadow-2xs"
              >
                <Edit3 class="w-3.5 h-3.5" />
                <span>修改资料</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 视图 2: 添加或修改表单 (Add / Edit Mode) -->
        <div v-else class="space-y-3.5 flex-1 overflow-y-auto">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 class="text-xs font-bold text-slate-800">
              {{ viewMode === 'add' ? '增加新医生账号' : `修改【${formName}】账号资料` }}
            </h4>
            <button @click="viewMode = 'list'" class="text-xs text-slate-400 hover:text-slate-600 underline">
              返回账号列表
            </button>
          </div>

          <form @submit.prevent="handleSaveDoctor" class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User class="w-3.5 h-3.5 text-teal-600" /> 登录用户名
              </label>
              <input
                v-model="formUsername"
                :disabled="viewMode === 'edit'"
                type="text"
                placeholder="例如 zhang_doc"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-60 font-mono"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lock class="w-3.5 h-3.5 text-teal-600" />
                {{ viewMode === 'add' ? '登录密码 *' : '重置新密码 (留空表示保持原密码)' }}
              </label>
              <input
                v-model="formPassword"
                type="password"
                :placeholder="viewMode === 'add' ? '设置登录密码' : '若不修改密码请留空'"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">医生姓名 *</label>
                <input
                  v-model="formName"
                  type="text"
                  placeholder="例如: 张敏"
                  class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">职称</label>
                <input
                  v-model="formTitle"
                  type="text"
                  placeholder="例如: 主任医师"
                  class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building class="w-3.5 h-3.5 text-teal-600" /> 所属科室
              </label>
              <input
                v-model="formDepartment"
                type="text"
                placeholder="例如: 脾胃病科（消化内镜室）"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div class="pt-2 flex items-center space-x-2">
              <button
                type="button"
                @click="viewMode = 'list'"
                class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-[2] py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-1"
              >
                <Check class="w-4 h-4" />
                <span>{{ viewMode === 'add' ? '确认创建账号' : '保存修改资料' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>
