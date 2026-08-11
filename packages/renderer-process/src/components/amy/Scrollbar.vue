<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean;
    thumbWidth?: string;
  }>(),
  {
    disabled: false,
    thumbWidth: '6px',
  },
);

const wrapRef = useTemplateRef('wrap');
const viewRef = useTemplateRef('view');
const trackRef = useTemplateRef('track');
const thumbRef = useTemplateRef('thumb');

const viewId = useId();
const thumbPercent = ref(0); // 滑块高度占轨道百分比 (0-100)
const move = ref(0); // 滑块位移百分比 (0-100)
const progress = ref(0); // 滚动进度 (0-100)，供 aria-valuenow
const dragging = ref(false);

const { width, height } = useElementSize(wrapRef);
const { width: viewWidth, height: viewHeight } = useElementSize(viewRef);
const { height: trackHeight } = useElementSize(trackRef);

const sizeHeight = computed(() =>
  thumbPercent.value > 0 && thumbPercent.value < 100 ? `${thumbPercent.value}%` : '',
);

const thumbStyle = computed(() => {
  // move 是轨道高度百分比，但 translateY(%) 相对滑块自身尺寸，
  // 必须换算成轨道像素高度，否则滚到底时滑块无法到达轨道底部
  const translateY = trackHeight.value > 0 ? (move.value / 100) * trackHeight.value : 0;
  return {
    height: sizeHeight.value,
    transform: `translateY(${translateY}px)`,
  };
});

function update() {
  const wrap = wrapRef.value;
  if (!wrap) return;
  const { scrollHeight, clientHeight } = wrap;
  const percent = scrollHeight > 0 ? (clientHeight / scrollHeight) * 100 : 100;
  thumbPercent.value = Math.min(100, percent);
}

watch([width, height, viewWidth, viewHeight], update);
onMounted(update);

// —— 滚动同步（rAF 节流，避免高频响应式更新）——
let rafId = 0;

function handleScroll() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    syncThumbPosition();
  });
}

function syncThumbPosition() {
  const wrap = wrapRef.value;
  if (!wrap) return;
  const maxScroll = wrap.scrollHeight - wrap.clientHeight;
  if (maxScroll <= 0) {
    move.value = 0;
    progress.value = 0;
    return;
  }
  progress.value = (wrap.scrollTop / maxScroll) * 100;
  // 位移范围需减去滑块自身高度，否则滚到底时滑块会掉出轨道
  move.value = progress.value * (1 - thumbPercent.value / 100);
}

// —— 键盘滚动（原生滚动条已隐藏，必须自行支持键盘操作）——
function handleKeydown(e: KeyboardEvent) {
  const wrap = wrapRef.value;
  if (!wrap) return;
  const maxScroll = wrap.scrollHeight - wrap.clientHeight;
  if (maxScroll <= 0) return;

  const pageStep = wrap.clientHeight;
  const lineStep = e.shiftKey ? pageStep : Math.max(40, pageStep * 0.1);
  let next = wrap.scrollTop;
  switch (e.key) {
    case 'ArrowDown':
      next += lineStep;
      break;
    case 'ArrowUp':
      next -= lineStep;
      break;
    case 'PageDown':
      next += pageStep;
      break;
    case 'PageUp':
      next -= pageStep;
      break;
    case 'Home':
      next = 0;
      break;
    case 'End':
      next = maxScroll;
      break;
    default:
      return;
  }
  wrap.scrollTop = Math.min(maxScroll, Math.max(0, next));
  e.preventDefault();
}

// —— 点击轨道跳转（与拖动一致的即时定位）——
function clickTrackHandler(e: MouseEvent) {
  const wrap = wrapRef.value;
  const track = trackRef.value;
  const thumb = thumbRef.value;
  if (!wrap || !track || !thumb) return;

  const offset = e.clientY - track.getBoundingClientRect().top;
  const thumbHalf = thumb.offsetHeight / 2;
  const thumbPositionPercentage = ((offset - thumbHalf) * 100) / track.offsetHeight;
  wrap.scrollTop = (thumbPositionPercentage * wrap.scrollHeight) / 100;
}

// —— 拖动滑块（鼠标 + 触摸统一）——
let dragState: { axisY: number } | null = null;

function clickThumbHandler(e: MouseEvent) {
  if (e.ctrlKey || e.button === 2) return;
  startDrag(e);
}

/** 鼠标或触摸事件的 clientY（触摸事件必然至少有一个触点） */
function getClientY(e: MouseEvent | TouchEvent) {
  return 'touches' in e ? e.touches[0]!.clientY : e.clientY;
}

function startDrag(e: MouseEvent | TouchEvent) {
  const thumb = thumbRef.value;
  if (!thumb) return;

  e.stopImmediatePropagation(); // 阻止冒泡触发轨道点击
  const clientY = getClientY(e);
  dragState = { axisY: thumb.offsetHeight - (clientY - thumb.getBoundingClientRect().top) };
  dragging.value = true;

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('touchend', onDragEnd);
  document.addEventListener('selectstart', preventSelection);
}

function onDragMove(e: MouseEvent | TouchEvent) {
  if (!dragging.value || !dragState) return;
  const wrap = wrapRef.value;
  const track = trackRef.value;
  const thumb = thumbRef.value;
  if (!wrap || !track || !thumb) return;

  // 阻止拖动过程中触发文本选择 / 触摸内容滚动
  if (e.cancelable) e.preventDefault();

  const clientY = getClientY(e);
  const offset = clientY - track.getBoundingClientRect().top;
  const thumbClickPosition = thumb.offsetHeight - dragState.axisY;
  const thumbPositionPercentage = ((offset - thumbClickPosition) * 100) / track.offsetHeight;
  wrap.scrollTop = (thumbPositionPercentage * wrap.scrollHeight) / 100;
}

function onDragEnd() {
  dragging.value = false;
  dragState = null;
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
  document.removeEventListener('touchmove', onDragMove);
  document.removeEventListener('touchend', onDragEnd);
  document.removeEventListener('selectstart', preventSelection);
}

function preventSelection(e: Event) {
  e.preventDefault();
}

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
  // 拖动中卸载时清理全部 document 监听，避免污染全局状态（文本选择被禁等）
  onDragEnd();
});
</script>

<template>
  <div
    class="scrollbar h-full w-full position-relative"
    :class="{ 'is-dragging': dragging }"
  >
    <!-- 原生滚动条已隐藏（见样式），滚动行为由内容手势/滚轮/键盘驱动 -->
    <div
      ref="wrap"
      class="h-full w-full overflow-x-hidden scrollbar__wrap"
      :class="[disabled ? 'overflow-y-hidden!' : 'overflow-y-auto']"
      role="scrollbar"
      aria-orientation="vertical"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="progress"
      :aria-controls="viewId"
      :tabindex="disabled ? -1 : 0"
      @scroll="handleScroll"
      @keydown="handleKeydown"
    >
      <div :id="viewId" ref="view" class="scrollbar__view">
        <slot />
      </div>
    </div>

    <div
      v-if="!disabled"
      ref="track"
      class="scrollbar__track"
      :style="{ width: thumbWidth }"
      @mousedown="clickTrackHandler"
    >
      <div
        ref="thumb"
        class="scrollbar__thumb"
        aria-hidden="true"
        :style="thumbStyle"
        @mousedown="clickThumbHandler"
        @touchstart.prevent="startDrag"
      ></div>
    </div>
  </div>
</template>

<style lang="scss">
.scrollbar {
  &__wrap {
    // overflow 由模板类控制（overflow-x-hidden / overflow-y-auto），
    // 此处仅隐藏原生滚动条，避免无 layer 的 SCSS 覆盖 Tailwind utilities
    scrollbar-width: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  &:hover,
  &:focus-within,
  &.is-dragging {
    > .scrollbar__track {
      opacity: 1;
      transition: opacity 340ms ease-out;
    }
  }

  &__track {
    position: absolute;
    right: 2px;
    bottom: 2px;
    z-index: 1;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 120ms ease-out;
    top: 2px;
  }

  &__thumb {
    position: relative;
    display: block;
    width: 100%;
    height: 0;
    cursor: pointer;
    border-radius: inherit;
    background-color: var(--ui-text-muted);
    transition: 0.3s background-color;
    z-index: 9999;

    &:hover,
    &:active {
      background-color: var(--ui-text-toned);
    }
  }
}
</style>
