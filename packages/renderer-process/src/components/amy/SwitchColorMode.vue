<script setup lang="ts">
/**
 * 白天 / 暗黑模式切换按钮
 * 基于 View Transitions API 实现圆形扩散/收缩动画：
 * - 白天 → 暗黑：暗黑效果从按钮圆心向整个页面扩散
 * - 暗黑 → 白天：暗黑效果从整个页面向按钮圆心收缩
 * 不支持 API 或系统开启"减少动态效果"时退化为直接切换。
 */
const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === 'dark');

/** 动画方向通过 CSS 变量注入，避免为两个方向维护两套选择器 */
function applyTransitionVars(x: number, y: number, goingDark: boolean) {
  const style = document.documentElement.style;
  style.setProperty('--theme-x', `${x}px`);
  style.setProperty('--theme-y', `${y}px`);
  if (goingDark) {
    // 暗黑快照从圆心扩散；白天快照保持静止（不淡出），
    // 让动画只有一条清晰的圆形边界在扫动，视觉最干净
    style.setProperty('--theme-new-anim', 'theme-circle-expand');
    style.setProperty('--theme-old-anim', 'none');
    style.setProperty('--theme-old-z', '1');
    style.setProperty('--theme-new-z', '10');
  } else {
    // 暗黑快照向圆心收缩（暗黑置顶可见），白天快照静止在下层
    style.setProperty('--theme-new-anim', 'none');
    style.setProperty('--theme-old-anim', 'theme-circle-collapse');
    style.setProperty('--theme-old-z', '10');
    style.setProperty('--theme-new-z', '1');
  }
}

function clearTransitionVars() {
  const style = document.documentElement.style;
  for (const name of ['--theme-x', '--theme-y', '--theme-new-anim', '--theme-old-anim', '--theme-old-z', '--theme-new-z']) {
    style.removeProperty(name);
  }
}

async function toggle(e: MouseEvent) {
  const goingDark = !isDark.value;
  const supportsViewTransition =
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!supportsViewTransition) {
    colorMode.preference = goingDark ? 'dark' : 'light';
    return;
  }

  // 以按钮中心为动画圆心
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  applyTransitionVars(rect.left + rect.width / 2, rect.top + rect.height / 2, goingDark);

  const transition = document.startViewTransition(async () => {
    colorMode.preference = goingDark ? 'dark' : 'light';
    // 等待 Vue 微任务队列把主题 class 应用到 html，快照才能捕获新主题。
    // 注意：不能用 requestAnimationFrame 等待——窗口失焦/不可见时 rAF 不触发，
    // 会让 transition 悬挂直到超时（页面表现为卡死）。
    await Promise.race([
      nextTick(),
      new Promise<void>((resolve) => setTimeout(resolve, 1000)),
    ]);
  });

  // 动画结束清理过渡变量；被中断/超时 abort 时静默降级，避免 unhandled rejection
  transition.finished
    .catch(() => {})
    .finally(() => clearTransitionVars());
}
</script>

<template>
  <ClientOnly>
    <button
      class="switch-color-mode"
      :aria-label="isDark ? '切换到白天模式' : '切换到暗黑模式'"
      @click="toggle"
    >
      <Transition name="mode-icon" mode="out-in">
        <UIcon :key="isDark ? 'dark' : 'light'" :name="isDark ? 'i-lucide-moon' : 'i-lucide-sun'" class="size-5" />
      </Transition>
    </button>
    <template #fallback>
      <div class="switch-color-mode" />
    </template>
  </ClientOnly>
</template>

<style lang="scss">
.switch-color-mode {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: var(--ui-text-muted);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: color-mix(in srgb, var(--ui-text-dimmed) 40%, transparent);
    color: var(--ui-text);
  }
}

/* 按钮内图标切换动画（旋转 + 淡入淡出） */
.mode-icon-enter-active,
.mode-icon-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.mode-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
}

.mode-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}

/* ============================================
   主题切换圆形扩散/收缩动画（View Transitions API）
   方向由 JS 注入的 CSS 变量控制：
   --theme-new-anim / --theme-old-anim（动画名）
   --theme-new-z / --theme-old-z（快照层级）
   --theme-x / --theme-y（动画圆心）
   ============================================ */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
  // easeInOutCubic：起止都柔和，边界"长出/收拢"时速度自然放缓，避免生硬
  animation-duration: 0.6s;
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  animation-fill-mode: both;
}

::view-transition-old(root) {
  animation-name: var(--theme-old-anim, none);
  z-index: var(--theme-old-z, 1);
}

::view-transition-new(root) {
  animation-name: var(--theme-new-anim, none);
  z-index: var(--theme-new-z, 10);
}

// 注意：不要给快照加 transform 缩放——快照是整页位图，放大会让远离圆心
// 的页面内容位移明显，观感上是整个页面变形
@keyframes theme-circle-expand {
  from {
    clip-path: circle(0px at var(--theme-x) var(--theme-y));
  }
  to {
    clip-path: circle(150% at var(--theme-x) var(--theme-y));
  }
}

@keyframes theme-circle-collapse {
  from {
    clip-path: circle(150% at var(--theme-x) var(--theme-y));
  }
  to {
    clip-path: circle(0px at var(--theme-x) var(--theme-y));
  }
}
</style>
