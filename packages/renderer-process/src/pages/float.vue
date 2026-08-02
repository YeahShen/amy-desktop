<script setup lang="ts">
definePageMeta({
  layout: 'empty',
});

useHead({
  bodyAttrs: {
    style: '--ui-bg: transparent',
    class: 'float-window-body',
  },
});

const showMenu = ref(false);
const drag = ref(false);

const positionStyle = computed(() => {
  return {
    top: '215px',
    left: '215px',
    right: '215px',
    bottom: '215px',
    borderRadius: '100%',
  };
});

function handleMouseEnter() {
  window.electronAPI.send('set-ignore-mouse-events', false);
}

function handleMouseLeave() {
  window.electronAPI.send('set-ignore-mouse-events', true);
}

function handleMouseDown(event: MouseEvent) {
  drag.value = true;

  const { screenY, screenX } = event;

  console.log(event);
}

function handleMouseUp() {
  drag.value = false;
}

const startX = ref<number>();
const startY = ref<number>();

function handleMouseMove() {
  console.log('handleMouseMove');
}
</script>

<template>
  <div class="relative w-full h-full">
    <div
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      class="float-window-wrap glass-floating-window w-17.5 h-17.5 absolute transition duration-150 ease-in-out cursor-pointer"
      :style="{ ...positionStyle }"
    >
      {{ drag }}
    </div>
  </div>
</template>

<style lang="scss">
.float-window-body {
  #nuxt-devtools-container {
    display: none !important;
  }
}
/* 毛玻璃悬浮窗类名 */
.glass-floating-window {
  /* 背景与模糊 */
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  /* 质感边框与高光 */
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);

  /* 内容排版 */
  color: #ffffff;
}

.glass-floating-window h3 {
  margin-top: 0;
  font-size: 1.25rem;
}

.glass-floating-window p {
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.5;
}
</style>
