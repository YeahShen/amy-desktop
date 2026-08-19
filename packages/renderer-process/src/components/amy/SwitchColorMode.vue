<script setup lang="ts">
/**
 * 白天 / 暗黑模式切换按钮
 * 基于 View Transitions API 实现圆形扩散动画：
 * - 白天 → 暗黑：暗黑效果从按钮圆心向整个页面扩散
 * - 暗黑 → 白天：亮色效果从按钮圆心向整个页面扩散
 * 两个方向统一为"新主题快照置顶扩散"，旧主题固定在下层：
 * 即使动画在收尾阶段被浏览器取消（Chromium finished 时序竞态），
 * 顶层快照与页面最终主题一致，闪烁在构造上不可见。
 * 不支持 API 或系统开启"减少动态效果"时退化为直接切换。
 */
const { isDark, toggleMode } = useColorMode();

/** 注入动画圆心；方向不区分——新主题快照始终置顶扩散 */
function applyTransitionVars(x: number, y: number) {
  const style = document.documentElement.style;
  style.setProperty('--theme-x', `${x}px`);
  style.setProperty('--theme-y', `${y}px`);
}

async function toggle(e: MouseEvent) {
  // const goingDark = !isDark.value;
  const supportsViewTransition =
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!supportsViewTransition) {
    // colorMode.preference = goingDark ? 'dark' : 'light';

    toggleMode();

    return;
  }

  // 以按钮中心为动画圆心
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  applyTransitionVars(rect.left + rect.width / 2, rect.top + rect.height / 2);

  const transition = document.startViewTransition(async () => {
    // colorMode.preference = goingDark ? 'dark' : 'light';

    toggleMode();

    // 等待 Vue 微任务队列把主题 class 应用到 html，快照才能捕获新主题。
    // 注意：不能用 requestAnimationFrame 等待——窗口失焦/不可见时 rAF 不触发，
    // 会让 transition 悬挂直到超时（页面表现为卡死）。
    await Promise.race([nextTick(), new Promise<void>((resolve) => setTimeout(resolve, 1000))]);
  });

  // 被中断/超时 abort 时静默降级，避免 unhandled rejection。
  // 不在 finished 后清理 --theme-x/y：keyframes 中的变量在动画创建时即解析，
  // 清理无必要；且在快照伪元素拆除前改动样式有触发一帧闪烁的竞态风险，
  // 变量会在下次切换前被重新写入，遗留无害。
  transition.finished.catch(() => {});
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
        <NuxtIcon
          :key="isDark ? 'dark' : 'light'"
          :name="isDark ? 'amy:moon' : 'amy:sun'"
          size="20"
        />
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
   主题切换圆形扩散动画（View Transitions API）
   两个方向统一：新主题快照置顶（z-index: 10）从圆心扩散，
   旧主题固定在下层（z-index: 1）静止不淡出，
   视觉上只有一条清晰的圆形边界在扫动
   --theme-x / --theme-y：动画圆心
   ============================================ */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
  // easeInOutCubic：起止都柔和，边界"长出"时速度自然放缓，避免生硬
  animation-duration: 0.6s;
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  animation-fill-mode: both;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 10;
  animation-name: theme-circle-expand;
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
</style>
