<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import type { EndoscopyImage } from '../../types';
import { X, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Download } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  images: EndoscopyImage[];
  currentIndex: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:currentIndex', index: number): void;
}>();

const scale = ref(1);
const rotation = ref(0);

watch(
  () => props.currentIndex,
  () => {
    scale.value = 1;
    rotation.value = 0;
  }
);

function handleZoomIn() {
  if (scale.value < 3) scale.value += 0.25;
}

function handleZoomOut() {
  if (scale.value > 0.5) scale.value -= 0.25;
}

function handleRotate() {
  rotation.value = (rotation.value + 90) % 360;
}

function prevImage() {
  if (props.currentIndex > 0) {
    emit('update:currentIndex', props.currentIndex - 1);
  }
}

function nextImage() {
  if (props.currentIndex < props.images.length - 1) {
    emit('update:currentIndex', props.currentIndex + 1);
  }
}

function downloadImage() {
  const current = props.images[props.currentIndex];
  if (!current) return;
  const a = document.createElement('a');
  a.href = current.url;
  a.download = `${current.name || 'endoscopy-image'}.jpg`;
  a.click();
}

function handleKeyDown(e: KeyboardEvent) {
  if (!props.show) return;
  if (e.key === 'Escape') emit('close');
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'ArrowRight') nextImage();
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && images.length > 0"
      class="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md transition-opacity duration-200 select-none"
    >
      <!-- 顶部控制栏 -->
      <div class="flex items-center justify-between px-4 py-3 bg-slate-900/80 text-white border-b border-slate-800">
        <div class="flex items-center space-x-2">
          <span class="text-xs px-2.5 py-1 bg-cyan-600/30 text-cyan-400 font-medium rounded-full border border-cyan-500/30">
            {{ currentIndex + 1 }} / {{ images.length }}
          </span>
          <span v-if="images[currentIndex]?.tag" class="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
            {{ images[currentIndex].tag }}
          </span>
        </div>

        <!-- 操作工具组 -->
        <div class="flex items-center space-x-3">
          <button @click="handleZoomOut" class="p-2 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white" title="缩小">
            <ZoomOut class="w-5 h-5" />
          </button>
          <span class="text-xs text-slate-400 font-mono w-10 text-center">{{ Math.round(scale * 100) }}%</span>
          <button @click="handleZoomIn" class="p-2 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white" title="放大">
            <ZoomIn class="w-5 h-5" />
          </button>
          <button @click="handleRotate" class="p-2 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white" title="旋转">
            <RotateCw class="w-5 h-5" />
          </button>
          <button @click="downloadImage" class="p-2 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white" title="下载高清原图">
            <Download class="w-5 h-5" />
          </button>
          <button @click="emit('close')" class="p-2 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-full" title="关闭">
            <X class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- 图片主展示区 -->
      <div class="relative flex-1 flex items-center justify-center overflow-hidden p-4">
        <!-- 左右切换按钮 -->
        <button
          v-if="currentIndex > 0"
          @click="prevImage"
          class="absolute left-3 z-10 p-3 bg-slate-900/60 hover:bg-slate-800 text-white rounded-full backdrop-blur transition-all active:scale-95"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>

        <div class="flex items-center justify-center w-full h-full">
          <img
            :src="images[currentIndex]?.url"
            :alt="images[currentIndex]?.name"
            class="max-w-full max-h-full object-contain transition-transform duration-150 ease-out shadow-2xl rounded-sm"
            :style="{
              transform: `scale(${scale}) rotate(${rotation}deg)`
            }"
          />
        </div>

        <button
          v-if="currentIndex < images.length - 1"
          @click="nextImage"
          class="absolute right-3 z-10 p-3 bg-slate-900/60 hover:bg-slate-800 text-white rounded-full backdrop-blur transition-all active:scale-95"
        >
          <ChevronRight class="w-6 h-6" />
        </button>
      </div>

      <!-- 底部图片说明 -->
      <div class="px-4 py-3 bg-slate-900/90 text-slate-300 text-center text-sm border-t border-slate-800">
        <p class="font-medium text-white">{{ images[currentIndex]?.name || '内镜病灶照片' }}</p>
        <p class="text-xs text-slate-400 mt-0.5">支持左右滑动或点击按钮切换图集，点击上方工具可缩放及旋转</p>
      </div>
    </div>
  </Teleport>
</template>
