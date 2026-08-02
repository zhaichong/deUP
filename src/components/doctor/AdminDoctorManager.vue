<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchDoctorsList, updateDoctor, registerDoctor, deleteDoctor, type DoctorSession } from '../../api';
import { Users, UserPlus, Edit3, Trash2, X, Check, Lock, User, Building, ShieldCheck, Stethoscope, AlertCircle } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const doctors = ref<DoctorSession[]>([]);
const isLoading = ref(false);
const isDeletingId = ref<string | null>(null);
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
  errorMessage.value = '';
  try {
    const list = await fetchDoctorsList();
    doctors.value = list;
  } catch (err: any) {
    errorMessage.value = '加载医生账号列表失败';
  } finally {
    isLoading.value = false;
  }
}

// 监听弹窗打开状态，弹窗打开时立即刷新列表
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      viewMode.value = 'list';
      errorMessage.value = '';
      successMessage.value = '';
      loadDoctors();
    }
  },
  { immediate: true }
);

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

async function handleDeleteDoctor(doc: DoctorSession) {
  if (doc.role === 'admin' || doc.username === 'admin') {
    alert('系统管理员账号受系统保护，不可删除。');
    return;
  }

  const ok = window.confirm(`⚠️ 确定要注销并删除医生【${doc.name}】(@${doc.username}) 的账号吗？\n\n删除后该医生将无法登录工作台。`);
  if (!ok) return;

  isDeletingId.value = doc.id;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await deleteDoctor(doc.id);
    successMessage.value = `已成功注销并删除医生【${doc.name}】账号`;
    await loadDoctors();
  } catch (err: any) {
    errorMessage.value = err.message || '删除账号失败';
  } finally {
    isDeletingId.value = null;
  }
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
      setTimeout(() => { 
        viewMode.value = 'list';
        successMessage.value = '';
      }, 1000);
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
      setTimeout(() => { 
        viewMode.value = 'list';
        successMessage.value = '';
      }, 1000);
    } catch (err: any) {
      errorMessage.value = err.message || '修改失败';
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full max-h-[88vh] flex flex-col space-y-4 border border-slate-100 relative">
        <!-- 弹窗 Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3.5 shrink-0">
          <div class="flex items-center space-x-2.5">
            <div class="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
              <Users class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center space-x-1.5">
                <h3 class="text-sm font-bold text-slate-900 font-serif">科室医生账号管理中心</h3>
                <span class="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded font-semibold border border-amber-200">
                  三甲中医院
                </span>
              </div>
              <p class="text-[10px] text-slate-400">管理、添加、修改与注销科室医生账号</p>
            </div>
          </div>

          <button @click="emit('close')" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 提示信息 Toast -->
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-700 rounded-2xl text-xs flex items-center space-x-2 border border-red-200 shrink-0">
          <AlertCircle class="w-4 h-4 shrink-0 text-red-500" />
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2 border border-emerald-200 shrink-0">
          <Check class="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{{ successMessage }}</span>
        </div>

        <!-- 视图 1: 医生账号列表 (List Mode) -->
        <div v-if="viewMode === 'list'" class="flex-1 overflow-y-auto space-y-3 pr-1">
          <div class="flex items-center justify-between pt-1">
            <span class="text-xs font-bold text-slate-700">全部医务人员 ({{ doctors.length }})</span>
            <button
              @click="openAddModal"
              class="flex items-center space-x-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span>添加新医生</span>
            </button>
          </div>

          <!-- 加载中 -->
          <div v-if="isLoading" class="text-center py-8 text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
            <div class="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>正在同步医生账号列表...</span>
          </div>

          <!-- 空列表 -->
          <div v-else-if="doctors.length === 0" class="text-center py-8 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
            <Users class="w-8 h-8 mx-auto text-slate-300" />
            <p class="text-xs text-slate-500 font-medium">暂无已录入的医生账号</p>
            <button
              @click="openAddModal"
              class="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span>立即添加第一位医生</span>
            </button>
          </div>

          <!-- 医生卡片列表 -->
          <div v-else class="space-y-2.5">
            <div
              v-for="doc in doctors"
              :key="doc.id"
              class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between hover:bg-slate-100/70 transition"
            >
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                    <Stethoscope class="w-3.5 h-3.5" />
                  </div>
                  <span class="text-xs font-bold text-slate-900">{{ doc.name }}</span>
                  <span class="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-medium">
                    {{ doc.title || '医师' }}
                  </span>
                  <span v-if="doc.role === 'admin'" class="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-bold border border-amber-300">
                    管理员
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 flex items-center space-x-2 font-mono pl-8">
                  <span>账号: @{{ doc.username }}</span>
                  <span>·</span>
                  <span>{{ doc.department }}</span>
                </div>
              </div>

              <!-- 操作按钮组 -->
              <div class="flex items-center space-x-1.5">
                <button
                  @click="openEditModal(doc)"
                  class="flex items-center space-x-1 px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-medium transition active:scale-95 shadow-2xs"
                  title="修改医生账号资料或密码"
                >
                  <Edit3 class="w-3.5 h-3.5" />
                  <span>修改</span>
                </button>

                <button
                  v-if="doc.role !== 'admin' && doc.username !== 'admin'"
                  @click="handleDeleteDoctor(doc)"
                  :disabled="isDeletingId === doc.id"
                  class="flex items-center space-x-1 px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-300 rounded-xl text-xs font-medium transition active:scale-95 shadow-2xs"
                  title="注销并删除该医生账号"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>{{ isDeletingId === doc.id ? '删除中...' : '删除' }}</span>
                </button>

                <span
                  v-else
                  class="text-[10px] px-2 py-1 text-slate-400 bg-slate-100 rounded-xl font-medium"
                  title="内置管理员受系统保护"
                >
                  受保护
                </span>
              </div>
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
                <User class="w-3.5 h-3.5 text-emerald-700" /> 登录用户名
              </label>
              <input
                v-model="formUsername"
                :disabled="viewMode === 'edit'"
                type="text"
                placeholder="例如 zhang_doc"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none disabled:opacity-60 font-mono"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lock class="w-3.5 h-3.5 text-emerald-700" />
                {{ viewMode === 'add' ? '登录密码 *' : '重置新密码 (留空表示保持原密码)' }}
              </label>
              <input
                v-model="formPassword"
                type="password"
                :placeholder="viewMode === 'add' ? '设置登录密码' : '若不修改密码请留空'"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">医生姓名 *</label>
                <input
                  v-model="formName"
                  type="text"
                  placeholder="例如: 张敏"
                  class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">职称</label>
                <input
                  v-model="formTitle"
                  type="text"
                  placeholder="例如: 主任医师"
                  class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building class="w-3.5 h-3.5 text-emerald-700" /> 所属科室
              </label>
              <input
                v-model="formDepartment"
                type="text"
                placeholder="例如: 脾胃病科（消化内镜室）"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
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
                class="flex-[2] py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-1"
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
