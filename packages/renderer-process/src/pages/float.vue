<script setup lang="ts">
definePageMeta({
  layout: 'empty',
  colorMode: 'dark',
});

useHead({
  bodyAttrs: {
    style: '--ui-bg: transparent;',
    class: 'float-window-body',
  },
});

const pointObj = Object.freeze({
  tl: { x: 215, y: 215 },
  tr: { x: 265, y: 215 },
  bl: { x: 215, y: 265 },
  br: { x: 265, y: 265 },
});

const showMenu = ref(false);
const showGlow = ref(true); // 呼吸光晕开关
const wrapRef = useTemplateRef<HTMLDivElement>('wrapRef');

const screenRect = ref<{ primary?: { width: number; height: number } }>({});
const windowPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 });

onMounted(async () => {
  screenRect.value = await window.electronAPI.invoke('get-screen-rect');
  windowPosition.value = await window.electronAPI.invoke('get-window-position');
});

const colorMode = useColorMode();

// 菜单项定义
const menuItems = [
  { icon: 'i-lucide-search', label: '搜索' },
  { icon: 'i-lucide-pencil', label: '笔记' },
  { icon: 'i-lucide-clipboard-list', label: '任务' },
  { icon: 'i-lucide-settings', label: '设置' },
];

const positionStyle = computed(() => {
  if (showMenu.value) {
    const position = { top: pointObj.tl.y, left: pointObj.tl.x };

    if (screenRect.value.primary) {
      const { width, height } = screenRect.value.primary;

      const uleft = windowPosition.value.x + 250 + 65 + 50;
      const utop = windowPosition.value.y + 250 + 65 + 100;

      if (uleft > width && utop > height) {
        position.top = pointObj.br.y - 200;
        position.left = pointObj.br.x - 130;
      }

      if (uleft > width && utop <= height) {
        position.top = pointObj.tr.y;
        position.left = pointObj.tr.x - 130;
      }

      if (uleft <= width && utop > height) {
        position.top = pointObj.bl.y - 200;
        position.left = pointObj.bl.x;
      }
    }

    return {
      top: `${position.top}px`,
      left: `${position.left}px`,
      width: '130px',
      height: '200px',
      borderRadius: '16px',
    };
  }

  return {
    top: `${pointObj.tl.y}px`,
    left: `${pointObj.tl.x}px`,
    width: '50px',
    height: '50px',
    borderRadius: '100%',
  };
});

let initialMouseX = 0;
let initialMouseY = 0;

let mouseDownTime = 0;
let windowInitialX = 0;
let windowInitialY = 0;

watchEffect(() => {
  if (wrapRef.value && import.meta.client) {
    wrapRef.value?.addEventListener('mouseenter', handleMouseEnter);
    wrapRef.value?.addEventListener('mouseleave', handleMouseLeave);
    wrapRef.value?.addEventListener('mousedown', handleMouseDown);
    wrapRef.value?.addEventListener('drop', handleDrop);

    wrapRef.value?.addEventListener('dragover', (e) => e.preventDefault());
    wrapRef.value?.addEventListener('dragover', (e) => e.preventDefault());

    handleMouseLeave();
  }
});

function handleMouseEnter() {
  window.electronAPI.send('set-ignore-mouse-events', false);
}

function handleMouseLeave() {
  window.electronAPI.send('set-ignore-mouse-events', true);
}

function handleMouseDown(e: MouseEvent) {
  initialMouseX = e.screenX; // 使用screenX/screenY获取相对于屏幕的坐标
  initialMouseY = e.screenY;
  mouseDownTime = Date.now();

  window.electronAPI.invoke<{ x: number; y: number }>('get-window-position').then(({ x, y }) => {
    windowInitialX = x;
    windowInitialY = y;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });
}

function handleMouseUp() {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}

function handleMouseMove(e: MouseEvent) {
  const deltaX = e.screenX - initialMouseX;
  const deltaY = e.screenY - initialMouseY;

  const newX = windowInitialX + deltaX;
  const newY = windowInitialY + deltaY;

  windowPosition.value = { x: newX, y: newY };

  window.electronAPI.send('set-window-position', { x: newX, y: newY, window: 'float' });
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  showMenu.value = true;
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function onMenuItemClick(item: (typeof menuItems)[number]) {
  // eslint-disable-next-line no-console
  console.log('Menu item clicked:', item.label);
  showMenu.value = false; // 点击菜单项后关闭菜单
}
</script>

<template>
  <div class="relative w-full h-full">
    <!-- 悬浮窗主体 -->
    <div
      ref="wrapRef"
      class="float-window-wrap glass-floating-window absolute cursor-pointer select-none"
      :style="{ ...positionStyle }"
      :class="{ 'is-expanded': showMenu }"
    >
      <!-- ========== 折叠态：圆形悬浮按钮 ========== -->
      <div
        v-if="!showMenu"
        class="collapsed-content flex items-center justify-center w-full h-full"
      >
        <div class="float-logo">
          <AmyLogo
            size="33"
            :color="colorMode.value === 'light' ? 'rgba(0,0,0,0.85)' : 'rgba(255, 255, 255, 0.65)'"
            :animation="showGlow"
          />
        </div>
        <!-- 呼吸光晕 -->
        <div v-if="showGlow" class="glow-ring glow-ring-1"></div>
        <div v-if="showGlow" class="glow-ring glow-ring-2"></div>
      </div>

      <!-- ========== 展开态：菜单面板 ========== -->
      <div v-else class="expanded-content flex flex-col h-full">
        <!-- 头部 -->
        <div class="menu-header flex items-center justify-between shrink-0">
          <span class="menu-title">AMY</span>
          <button class="menu-close-btn flex items-center justify-center" @click.stop="toggleMenu">
            <span class="i-lucide-x close-icon"></span>
          </button>
        </div>

        <!-- 分隔线 -->
        <div class="menu-divider shrink-0"></div>

        <!-- 菜单项列表 -->
        <div class="menu-body flex-1 overflow-hidden">
          <button
            v-for="item in menuItems"
            :key="item.label"
            class="menu-item flex items-center gap-2"
            @click="onMenuItemClick(item)"
          >
            <span :class="[item.icon, 'menu-item-icon']"></span>
            <span class="menu-item-label">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
/* ============================================
   页面级：隐藏 Nuxt DevTools 容器
   ============================================ */
.float-window-body {
  #nuxt-devtools-container {
    display: none !important;
  }
}

/* ============================================
   悬浮窗主体
   ============================================ */
.float-window-wrap {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  user-select: none;
}

/* ============================================
   毛玻璃基础样式 — 偏白磨砂质感
   ============================================ */
.glass-floating-window {
  // 背景：偏白半透明 + 模糊
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);

  // 渐变高光：模拟磨砂玻璃表面不均匀反光
  background-image: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.2) 40%,
    rgba(255, 255, 255, 0.08) 70%,
    rgba(255, 255, 255, 0.25) 100%
  );

  // 磨砂玻璃边框
  border: 1px solid rgba(255, 255, 255, 0.55);
  // 外阴影 + 内高光
  box-shadow:
    0 4px 24px 0 rgba(0, 0, 0, 0.08),
    0 1px 4px 0 rgba(0, 0, 0, 0.04),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.6);

  color: rgba(0, 0, 0, 0.75);

  // Hover 态：更不透亮
  &:hover {
    background: rgba(255, 255, 255, 0.78);
    box-shadow:
      0 6px 30px 0 rgba(0, 0, 0, 0.12),
      0 2px 6px 0 rgba(0, 0, 0, 0.06),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.7);
  }

  // 展开态：更白，模糊更强
  &.is-expanded {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
  }
}

/* ============================================
   折叠态：圆形悬浮按钮
   ============================================ */
.collapsed-content {
  position: relative;

  .float-logo {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.55);
    box-shadow:
      0 1px 8px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);

    .logo-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.65);
    }
  }
}

/* 呼吸光晕 — 调整为深色调以匹配白底 */
.glow-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.12);
  pointer-events: none;

  &.glow-ring-1 {
    width: 45px;
    height: 45px;
    animation: float-breathe 2.5s ease-in-out infinite;
  }

  &.glow-ring-2 {
    width: 48px;
    height: 48px;
    animation: float-breathe 2.5s ease-in-out 0.6s infinite;
  }
}

@keyframes float-breathe {
  0%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.85);
  }
  50% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1.05);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.85);
  }
}

/* ============================================
   展开态：菜单面板
   ============================================ */
.expanded-content {
  padding: 8px 0;
}

/* 头部 */
.menu-header {
  padding: 4px 12px 2px 14px;
  height: 36px;

  .menu-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: rgba(0, 0, 0, 0.7);
  }

  .menu-close-btn {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.06);
    border: none;
    cursor: pointer;
    transition: background 0.15s ease;
    padding: 0;

    &:hover {
      background: rgba(0, 0, 0, 0.12);
    }

    &:active {
      background: rgba(0, 0, 0, 0.08);
    }

    .close-icon {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.55);
    }
  }
}

/* 分隔线 */
.menu-divider {
  height: 1px;
  margin: 4px 10px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.08) 20%,
    rgba(0, 0, 0, 0.08) 80%,
    transparent 100%
  );
}

/* 菜单项列表 */
.menu-body {
  display: flex;
  flex-direction: column;
  padding: 4px 6px;
  gap: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  color: rgba(0, 0, 0, 0.65);

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }

  &:active {
    background: rgba(0, 0, 0, 0.04);
  }

  .menu-item-icon {
    font-size: 17px;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .menu-item-label {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
}

/* ============================================
   暗色模式适配
   ============================================ */
.dark .glass-floating-window {
  background: rgba(40, 40, 50, 0.7);
  background-image: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.03) 40%,
    rgba(255, 255, 255, 0.01) 70%,
    rgba(255, 255, 255, 0.06) 100%
  );
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow:
    0 4px 24px 0 rgba(0, 0, 0, 0.35),
    0 1px 4px 0 rgba(0, 0, 0, 0.2),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);

  &:hover {
    background: rgba(40, 40, 50, 0.82);
    box-shadow:
      0 6px 30px 0 rgba(0, 0, 0, 0.45),
      0 2px 6px 0 rgba(0, 0, 0, 0.25),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
  }

  &.is-expanded {
    background: rgba(40, 40, 50, 0.78);
  }
}

.dark {
  .float-logo {
    background: rgba(255, 255, 255, 0.12);
    box-shadow:
      0 1px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);

    .logo-icon {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .glow-ring {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .menu-title {
    color: rgba(255, 255, 255, 0.85);
  }

  .menu-close-btn {
    background: rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    &:active {
      background: rgba(255, 255, 255, 0.14);
    }

    .close-icon {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .menu-divider {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.12) 20%,
      rgba(255, 255, 255, 0.12) 80%,
      transparent 100%
    );
  }

  .menu-item {
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &:active {
      background: rgba(255, 255, 255, 0.06);
    }
  }
}
</style>
