<script setup lang="tsx">
import { message } from 'antdv-next';

const props = withDefaults(
  defineProps<{
    processImageFn?: (file: string) => void | Promise<void>;
    wrapClasses?: string;
  }>(),
  {
    wrapClasses: 'w-30 aspect-square',
  },
);

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const previewImg = ref<string>();
const fileBlob = defineModel<Blob | null>();
const fileInput = useTemplateRef<HTMLInputElement>('fileInput');

// 预览地址随 v-model 走：外部注入 Blob（如 video-info）和本地选择共用同一条路径
let previewUrl: string | undefined;

watch(fileBlob, (fb) => {
  // 换图 / 清空时回收上一个地址（此时它已加载完成，吊销不会影响已渲染的画面）
  if (previewUrl) URL.revokeObjectURL(previewUrl);

  previewUrl = fb ? URL.createObjectURL(fb) : undefined;
  previewImg.value = previewUrl;
});

onUnmounted(() => {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
});

function pickImage() {
  fileInput.value?.click();
}

async function onFileChange() {
  const input = fileInput.value;
  const file = input?.files?.[0];

  // 清空以便重复选择同一文件时仍触发 change；File 引用不受影响
  if (input) input.value = '';

  if (!file) return;

  // file.type 为空时（系统未注册该扩展名）交给 accept 与后端判断
  if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
    message.error('仅支持 JPG / PNG / WebP 格式的图片');
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    message.error(`图片大小不能超过 ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
    return;
  }

  fileBlob.value = file;

  try {
    await props.processImageFn?.(window.electronAPI.getPathForFile(file));
  } catch (e) {
    console.error(e);
  }
}

function removeImg() {
  fileBlob.value = null;
}
</script>

<template>
  <div
    :class="wrapClasses"
    class="group relative flex items-center justify-center px-0.5 py-0.5 overflow-hidden border border-dashed rounded-xl border-muted bg-(--ant-color-bg-container) text-muted hover:border-primary-border-hover hover:text-primary"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden!"
      @change="onFileChange"
    />

    <button
      v-if="!previewImg"
      type="button"
      aria-label="选择图片"
      class="w-full h-full flex items-center justify-center cursor-pointer"
      @click="pickImage"
    >
      <NuxtIcon name="amy:plus-outlined" />
    </button>

    <img v-else :src="previewImg" alt="已选图片" class="w-full h-full rounded-xl object-cover" />

    <div
      v-if="previewImg"
      class="absolute inset-0 z-999 hidden items-center justify-center bg-mask group-hover:flex"
    >
      <AButton type="text" aria-label="更换图片" @click="pickImage">
        <template #icon>
          <NuxtIcon name="amy:plus-outlined" class="text-white text-lg" />
        </template>
      </AButton>

      <AButton type="text" aria-label="移除图片" @click="removeImg">
        <template #icon>
          <NuxtIcon name="amy:trash-bin-trash-bold" class="text-white text-lg" />
        </template>
      </AButton>
    </div>
  </div>
</template>
