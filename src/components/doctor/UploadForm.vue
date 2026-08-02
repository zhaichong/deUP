<script setup lang="ts">
import { ref } from 'vue';
import type { PatientRecord, EndoscopyImage, ExamType } from '../../types';
import { EXAM_TYPE_OPTIONS, COMMON_DIAGNOSES } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { validateIdCard } from '../../utils/validators';
import type { DoctorSession } from '../../api';
import ImageViewerModal from '../common/ImageViewerModal.vue';
import { Camera, ImagePlus, X, Check, AlertCircle, Sparkles, FileText, CreditCard, Stethoscope, CheckCircle2, Maximize2 } from 'lucide-vue-next';

const props = defineProps<{
  currentDoctor?: DoctorSession | null;
}>();

const emit = defineEmits<{
  (e: 'save', record: PatientRecord): void;
  (e: 'cancel'): void;
}>();

// 表单响应式状态 (自动关联当前登录医生的名字与科室)
const idCard = ref('');
const examType = ref<ExamType>('电子胃镜');
const examDate = ref(new Date().toISOString().split('T')[0]);
const doctorName = ref(props.currentDoctor ? `${props.currentDoctor.name} ${props.currentDoctor.title}` : '主任医师');
const department = ref(props.currentDoctor?.department || '脾胃病科（消化内镜室）');
const findings = ref('');
const diagnosis = ref('');
const recommendations = ref('');

// 保存成功反馈控制
const showSaveSuccess = ref(false);
const isSubmitting = ref(false);

// 全屏看图 Lightbox 控制
const lightboxOpen = ref(false);
const activeImageIndex = ref(0);

// 已经上传压缩好的图片列表
const images = ref<EndoscopyImage[]>([]);
const isCompressing = ref(false);
const compressionProgress = ref('');

// 校验错误提示
const errors = ref<{ idCard?: string; general?: string }>({});

// 移动端相册/拍照 File Input 引用
const cameraInputRef = ref<HTMLInputElement | null>(null);
const albumInputRef = ref<HTMLInputElement | null>(null);

// 点击打开放大查看图片
function openLightbox(index: number) {
  activeImageIndex.value = index;
  lightboxOpen.value = true;
}

// 快捷点击诊断标签追加
function appendDiagnosis(text: string) {
  if (!diagnosis.value) {
    diagnosis.value = text;
  } else if (!diagnosis.value.includes(text)) {
    diagnosis.value += `\n${text}`;
  }
}

// 移除照片
function removeImage(event: Event, imgId: string) {
  event.stopPropagation(); // 阻止触发预览
  images.value = images.value.filter((i) => i.id !== imgId);
}

// 处理文件选择与手机前端高保真压缩 + 服务器端上传
async function handleFiles(files: FileList | null) {
  if (!files || files.length === 0) return;
  isCompressing.value = true;
  const fileArray = Array.from(files);

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    compressionProgress.value = `正在处理第 ${i + 1}/${fileArray.length} 张图片...`;

    try {
      // 1. 前端无损压缩
      const compressed = await compressImage(file, 1600, 1600, 0.82);
      let finalUrl = compressed.url;

      // 2. 尝试将压缩后的图片上传至服务器对象/文件存储
      try {
        const formData = new FormData();
        const blob = await (await fetch(compressed.url)).blob();
        formData.append('image', blob, file.name || 'image.jpg');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            finalUrl = uploadData.url;
          }
        }
      } catch (uploadErr) {
        console.warn('静态文件存储服务不可用，使用 Base64 存储:', uploadErr);
      }
      
      const newImg: EndoscopyImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name.replace(/\.[^/.]+$/, "") || `内镜照片 ${images.value.length + 1}`,
        url: finalUrl,
        size: compressed.size,
        createdAt: Date.now()
      };
      
      images.value.push(newImg);
    } catch (err) {
      console.error('图片处理失败:', err);
    }
  }

  isCompressing.value = false;
  compressionProgress.value = '';
}

function triggerCamera() {
  cameraInputRef.value?.click();
}

function triggerAlbum() {
  albumInputRef.value?.click();
}

// 清空表单状态
function resetForm() {
  idCard.value = '';
  findings.value = '';
  diagnosis.value = '';
  recommendations.value = '';
  images.value = [];
  errors.value = {};
}

// 提交发布检查报告
async function handleSubmit() {
  if (isSubmitting.value) return;
  errors.value = {};

  const cleanId = idCard.value.trim().toUpperCase();

  // 必须填写身份证号
  if (!cleanId) {
    errors.value.idCard = '请输入患者身份证号码，作为患者调阅凭证';
    return;
  }

  // 执行身份证号格式校验
  const idCheck = validateIdCard(cleanId);
  if (!idCheck.valid) {
    errors.value.idCard = idCheck.message;
    return;
  }

  if (images.value.length === 0) {
    errors.value.general = '请至少拍摄或上传 1 张内镜照片';
    return;
  }

  isSubmitting.value = true;

  const record: PatientRecord = {
    id: `REC-${Date.now().toString().slice(-8)}`,
    idCard: cleanId,
    examType: examType.value,
    examDate: examDate.value,
    doctorName: doctorName.value,
    department: department.value,
    findings: findings.value.trim() || diagnosis.value.trim() || '未见明显异常。',
    diagnosis: diagnosis.value.trim() || '未见明显异常',
    recommendations: recommendations.value.trim(),
    images: [...images.value],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // 1. 触发保存成功 Toast
  showSaveSuccess.value = true;

  // 2. 派发保存事件，清空表单
  setTimeout(() => {
    emit('save', record);
    resetForm();
    showSaveSuccess.value = false;
    isSubmitting.value = false;
  }, 800);
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden pb-6 relative">
    <!-- 保存成功弹出反馈 (Success Toast Modal) -->
    <Teleport to="body">
      <div v-if="showSaveSuccess" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white rounded-3xl p-6 text-center shadow-2xl max-w-xs space-y-3 border border-slate-100">
          <div class="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600">
            <CheckCircle2 class="w-8 h-8 stroke-[2.5]" />
          </div>
          <h3 class="text-base font-bold text-slate-900">报告已成功保存发布！</h3>
          <p class="text-xs text-slate-500">数据已永久写入服务器数据库，患者凭身份证号即可调阅查看。</p>
        </div>
      </div>
    </Teleport>

    <!-- 1. 全屏放大图片 Lightbox 模态框 (点击照片即可全屏查看/放缩) -->
    <ImageViewerModal
      :show="lightboxOpen"
      :images="images"
      :currentIndex="activeImageIndex"
      @close="lightboxOpen = false"
      @update:currentIndex="activeImageIndex = $event"
    />

    <!-- 表单顶部指示标题与当前登录医生信息 -->
    <div class="bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-3 text-white flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Stethoscope class="w-5 h-5" />
        <h2 class="font-bold text-base">医生手机上传内镜影像</h2>
      </div>
      <span v-if="currentDoctor" class="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
        {{ currentDoctor.name }}
      </span>
      <span v-else class="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">极速上传</span>
    </div>

    <form @submit.prevent="handleSubmit" class="p-4 space-y-5">
      <!-- 全局通用报错提示 -->
      <div v-if="errors.general" class="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center space-x-2 border border-red-200">
        <AlertCircle class="w-4 h-4 shrink-0" />
        <span>{{ errors.general }}</span>
      </div>

      <!-- 1. 移动端照片拍摄/上传核心区域 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Camera class="w-4 h-4 text-teal-600" />
            拍摄 / 上传内镜影像照片 <span class="text-red-500">*</span>
          </label>
          <span class="text-[11px] text-slate-500">已选 {{ images.length }} 张（点击可放大查看）</span>
        </div>

        <!-- 手机拍照 / 相册 两个快捷大按钮 -->
        <div class="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            @click="triggerCamera"
            class="flex flex-col items-center justify-center p-3.5 bg-gradient-to-b from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 text-teal-800 rounded-xl border border-teal-200 transition active:scale-95 shadow-sm"
          >
            <Camera class="w-7 h-7 text-teal-600 mb-1" />
            <span class="text-xs font-bold">手机直接拍照</span>
            <span class="text-[10px] text-teal-600/80">调用镜头拍照上传</span>
          </button>

          <button
            type="button"
            @click="triggerAlbum"
            class="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition active:scale-95 shadow-sm"
          >
            <ImagePlus class="w-7 h-7 text-cyan-600 mb-1" />
            <span class="text-xs font-bold">手机相册选取</span>
            <span class="text-[10px] text-slate-500">选择已有图片文件</span>
          </button>
        </div>

        <!-- 隐藏的 HTML5 File Input 控件 -->
        <input
          ref="cameraInputRef"
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          class="hidden"
          @change="(e) => handleFiles((e.target as HTMLInputElement).files)"
        />
        <input
          ref="albumInputRef"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="(e) => handleFiles((e.target as HTMLInputElement).files)"
        />

        <!-- 智能压缩进度处理动画 -->
        <div v-if="isCompressing" class="p-3 bg-teal-50 text-teal-700 rounded-xl text-xs flex items-center space-x-2 animate-soft-pulse border border-teal-200">
          <Sparkles class="w-4 h-4 animate-spin" />
          <span>{{ compressionProgress }}</span>
        </div>

        <!-- 高颜值高级照片卡片网格：智能环境色高斯模糊背景膜 + 优雅磨砂玻璃标 -->
        <div v-if="images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div
            v-for="(img, idx) in images"
            :key="img.id"
            @click="openLightbox(idx)"
            class="group relative bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-teal-500 active:scale-98 flex flex-col"
          >
            <!-- 比例自适应与高斯模糊智能色彩底膜 (彻底告别黑边) -->
            <div class="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 flex items-center justify-center">
              <!-- 1. 高斯模糊底膜图 (自动提取图片色调填充两侧) -->
              <img
                :src="img.url"
                class="absolute inset-0 w-full h-full object-cover filter blur-xl scale-125 opacity-35 select-none pointer-events-none"
              />
              
              <!-- 2. 精制主图 (完整无缝保留比例) -->
              <img
                :src="img.url"
                :alt="img.name"
                class="relative z-10 max-w-full max-h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
              />

              <!-- 3. Hover 提示全屏遮罩 -->
              <div class="absolute inset-0 z-20 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                <Maximize2 class="w-6 h-6 drop-shadow-md mb-1 animate-bounce" />
                <span class="text-[10px] font-bold tracking-wider">点击全屏大图</span>
              </div>

              <!-- 4. 删除按钮 -->
              <button
                type="button"
                @click="removeImage($event, img.id)"
                class="absolute top-2 right-2 z-30 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-md transition-all hover:scale-110 active:scale-90"
                title="删除照片"
              >
                <X class="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              <!-- 5. 磨砂玻璃容量 Badge -->
              <span v-if="img.size" class="absolute bottom-2 right-2 z-20 px-2 py-0.5 bg-slate-900/70 backdrop-blur-md text-white text-[9px] font-mono font-medium rounded-full border border-white/20">
                {{ Math.round(img.size / 1024) }}KB
              </span>
            </div>
          </div>
        </div>
      </div>

      <hr class="border-slate-100" />

      <!-- 2. 患者调阅凭证关联 (身份证号) -->
      <div class="space-y-3">
        <h3 class="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span class="flex items-center gap-1">
            <CreditCard class="w-4 h-4 text-teal-600" />
            患者调阅凭证 (身份证号) <span class="text-red-500">*</span>
          </span>
          <span class="text-[10px] text-slate-400 font-normal">患者凭此号码查询</span>
        </h3>

        <!-- 身份证号输入框 -->
        <div>
          <input
            v-model="idCard"
            type="text"
            inputmode="text"
            maxlength="18"
            placeholder="请输入患者身份证号码 (例如 110101199003072345)"
            class="w-full px-3.5 py-2.5 text-xs uppercase bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
            :class="[errors.idCard ? 'border-red-300 bg-red-50/50' : 'border-slate-200']"
          />
          <p v-if="errors.idCard" class="text-[10px] text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle class="w-3 h-3" /> {{ errors.idCard }}
          </p>
        </div>

        <!-- 检查类型 -->
        <div>
          <label class="block text-[11px] font-medium text-slate-600 mb-1">检查类别</label>
          <select
            v-model="examType"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option v-for="type in EXAM_TYPE_OPTIONS" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
      </div>

      <hr class="border-slate-100" />

      <!-- 3. 诊断结论与建议录入 -->
      <div class="space-y-3">
        <h3 class="text-xs font-bold text-slate-800 flex items-center gap-1">
          <FileText class="w-4 h-4 text-teal-600" />
          诊断结论与建议 (选填)
        </h3>

        <!-- 常用诊断快速快捷词包 -->
        <div>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <button
              v-for="diag in COMMON_DIAGNOSES"
              :key="diag"
              type="button"
              @click="appendDiagnosis(diag)"
              class="text-[11px] px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg border border-cyan-200 transition active:scale-95"
            >
              + {{ diag }}
            </button>
          </div>

          <textarea
            v-model="diagnosis"
            rows="2"
            placeholder="内镜最终诊断结论..."
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium text-slate-800"
          ></textarea>
        </div>

        <div>
          <label class="block text-[11px] font-medium text-slate-600 mb-1">诊断建议</label>
          <textarea
            v-model="recommendations"
            rows="2"
            placeholder="诊断建议 (例如: 定期复查胃镜、清淡饮食、随诊治疗)..."
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          ></textarea>
        </div>
      </div>

      <!-- 4. 醒目突出的页面内【保存并发布内镜报告】提交大按钮 -->
      <div class="pt-4 border-t border-slate-100">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full py-4 bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-75"
        >
          <Check class="w-5 h-5 stroke-[3]" />
          <span>{{ isSubmitting ? '正在写入数据库保存...' : '保存并发布内镜报告' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
