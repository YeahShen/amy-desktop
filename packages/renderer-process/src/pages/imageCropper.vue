<script setup lang="tsx">
import 'cropperjs/dist/cropper.css';
import type Cropper from 'cropperjs';
import type { CropperSelection } from 'cropperjs';

definePageMeta({
  layout: 'dialog',
  dialog: {
    title: '图片裁剪',
  },
});

const route = useRoute();

/* ==================== 弹窗参数（openDialog args → route.query） ==================== */
/** 待裁剪图片：远程 URL / /local?path= / /mock/api/* / data:URL */
const src = computed(() => (route.query.src as string) ?? '');
/** 输出文件名 */
const outputName = computed(() => (route.query.name as string) || 'cropped-image.png');
/** 圆形成像：输出透明背景的圆形 PNG（头像等场景） */
const circle = computed(() => route.query.shape === 'circle');
/** 目标输出宽度（px）；受原图宽度上限约束，避免放大糊图 */
const targetWidth = computed(() => {
  const n = Number(route.query.size);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 1024;
});
/** 裁剪框宽高比：数字（'1'、'1.77'、'16/9'）或 'free'（自由）；缺省 1:1 */
const aspectRatio = computed(() => {
  const raw = (route.query.aspectRatio as string) || '1';
  if (raw === 'free') return NaN;
  const [a, b] = raw.split('/').map(Number);
  // @ts-ignore
  const ratio = b > 0 ? a / b : Number(raw);
  return Number.isFinite(ratio) && ratio > 0 ? ratio : NaN;
});

const cropWrapRef = useTemplateRef('cropWrapRef');
const imgRef = useTemplateRef('imgRef');

const loading = ref(true);
const loadFailed = ref(false);
const emptySrc = computed(() => !src.value);

const cropper = shallowRef<Cropper | null>(null);
const selection = shallowRef<CropperSelection | null>(null);

onMounted(() => {
  if (emptySrc.value) {
    loading.value = false;
    return;
  }
  initCropper();
});

onBeforeUnmount(() => {
  cropper.value?.destroy();
});

async function initCropper() {
  try {
    const img = imgRef.value;
    const wrap = cropWrapRef.value;
    if (!img || !wrap) return;

    await waitImageLoaded(img);

    const { default: CropperModule } = await import('cropperjs');
    const instance = new CropperModule(img, { container: wrap });
    const sel = instance.getCropperSelection();
    if (!sel) throw new Error('未创建裁剪选区');

    sel.aspectRatio = aspectRatio.value;
    sel.zoomable = true;
    // 按锁定比例约束初始选区（force 强制重算宽高），并居中
    sel.$change(sel.x, sel.y, sel.width, sel.height, aspectRatio.value, true);
    sel.$center();

    cropper.value = instance;
    selection.value = sel;

    // 弹窗 / 容器尺寸变化时刷新选区渲染，避免错位
    const ro = new ResizeObserver(() => sel.$render());
    ro.observe(wrap);
    onScopeDispose(() => ro.disconnect());
  } catch (e) {
    console.error('[imageCropper] init failed:', e);
    loadFailed.value = true;
  } finally {
    loading.value = false;
  }
}

function waitImageLoaded(img: HTMLImageElement) {
  return new Promise<void>((resolve, reject) => {
    if (img.complete && img.naturalWidth > 0) {
      resolve();
      return;
    }
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => reject(new Error('图片加载失败')), { once: true });
  });
}

/* ==================== 工具栏操作 ==================== */
function rotate() {
  cropper.value?.getCropperImage()?.$rotate(90);
}

function zoomIn() {
  cropper.value?.getCropperImage()?.$zoom(0.1);
}

function zoomOut() {
  cropper.value?.getCropperImage()?.$zoom(-0.1);
}

function reset() {
  const sel = selection.value;
  if (sel) {
    sel.$reset();
    sel.aspectRatio = aspectRatio.value;
    sel.$change(sel.x, sel.y, sel.width, sel.height, sel.aspectRatio, true);
    sel.$center();
  }
  cropper.value?.getCropperImage()?.$resetTransform();
}

/* ==================== 确认输出（DialogFooter confirmFn → close(result)） ==================== */
async function confirm() {
  const sel = selection.value;
  if (!sel) return;

  const img = imgRef.value;
  const width = Math.min(targetWidth.value, img?.naturalWidth || targetWidth.value);
  const raw = await sel.$toCanvas({ width });

  // 圆形成像：从方图中心裁出半径最大的圆，保留透明背景
  const canvas = circle.value ? maskCircle(raw) : raw;
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

  return {
    dataUrl,
    blob,
    name: outputName.value,
    width: canvas.width,
    height: canvas.height,
  };
}

/** 从方图中心裁出半径最大的圆形区域 */
function maskCircle(source: HTMLCanvasElement): HTMLCanvasElement {
  const size = Math.min(source.width, source.height);
  const out = document.createElement('canvas');
  out.width = size;
  out.height = size;
  const ctx = out.getContext('2d');
  if (!ctx) return source;

  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(
    source,
    (source.width - size) / 2,
    (source.height - size) / 2,
    size,
    size,
    0,
    0,
    size,
    size,
  );
  ctx.restore();
  return out;
}
</script>

<template>
  <div class="w-full h-full px-4 py-3 flex flex-col gap-y-3">
    <!-- 裁剪预览区 -->
    <div
      ref="cropWrapRef"
      :class="circle ? 'crop-circle' : ''"
      class="relative flex-1 min-h-0 rounded-2xl overflow-hidden bg-container border border-default"
    >
      <img v-if="!emptySrc" ref="imgRef" :src="src" alt="待裁剪图片" />

      <div
        v-if="emptySrc"
        class="absolute inset-0 flex items-center justify-center text-muted text-sm"
      >
        缺少图片参数（src）
      </div>

      <div v-else-if="loading" class="absolute inset-0 flex items-center justify-center">
        <ASpin />
      </div>

      <div
        v-else-if="loadFailed"
        class="absolute inset-0 flex flex-col items-center justify-center gap-y-1 text-muted text-sm"
      >
        <p>图片加载失败</p>
        <p>请确认图片地址有效后重试</p>
      </div>
    </div>

    <!-- 底部操作区：左工具条 + 取消/确定 -->
    <DialogFooter :confirm-fn="confirm">
      <template #leftContext>
        <div class="flex items-center gap-x-1">
          <AButton type="text" size="small" title="缩小" :disabled="!cropper" @click="zoomOut">
            缩小
          </AButton>
          <AButton type="text" size="small" title="放大" :disabled="!cropper" @click="zoomIn">
            放大
          </AButton>
          <AButton type="text" size="small" title="旋转 90°" :disabled="!cropper" @click="rotate">
            旋转
          </AButton>
          <AButton type="text" size="small" title="重置" :disabled="!cropper" @click="reset">
            重置
          </AButton>
        </div>
      </template>
    </DialogFooter>
  </div>
</template>

<style lang="scss">
/* 圆形成像：裁剪框宿主裁成圆形（shadow 内容随宿主 overflow 一起裁剪） */
.crop-circle {
  :deep(.cropper-selection) {
    border-radius: 50% !important;
    overflow: hidden;
  }
}
</style>
