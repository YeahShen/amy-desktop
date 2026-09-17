<script setup lang="ts">
import bg from '@/assets/img/wallhaven-zpoxyj_1920x1080.png';

definePageMeta({
  workspace: 'artist',
  immersiveHeader: true,
});
</script>

<template>
  <LayoutPage>
    <div
      class="w-full h-57.5 bg-cover poster bg-center sticky top-0"
      :style="{ backgroundImage: `url(${bg})` }"
    ></div>

    <div class="profile-wrap"></div>
  </LayoutPage>
</template>

<style lang="scss">
.poster {
  isolation: isolate;
}
.poster::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: var(--img-url);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: var(--img-filter);
  transform: scale(1.02); /* 可选，防止模糊边缘露底 */
  transition:
    filter 0.3s ease,
    transform 0.3s ease;
}

.poster::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--img-overlay);
  backdrop-filter: var(--img-backdrop);
  -webkit-backdrop-filter: var(--img-backdrop);
  pointer-events: none;
  transition:
    background 0.3s ease,
    backdrop-filter 0.3s ease;
}
</style>
