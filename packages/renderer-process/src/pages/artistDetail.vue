<script setup lang="ts">
import bg from '@/assets/img/wallhaven-zpoxyj_1920x1080.png';

import { UserOutlined } from '@antdv-next/icons';

definePageMeta({
  workspace: 'artist',
  immersiveHeader: true,
});
</script>

<template>
  <LayoutPage class="bg-[#f6f7f8] dark:bg-[#0d0d0e]">
    <div class="profile-wrap h-(--navbar-height) w-full sticky top-0 bg-(--ui-bg)"></div>

    <div class="w-full bg-(--ui-bg) flex pt-12 pb-8">
      <div class="flex px-8 gap-x-6">
        <a-avatar :size="88" class="shrink-0">
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>

        <div class="flex flex-col gap-y-3">
          <p class="text-xl">硬核学长2077</p>
          <span class="text-toned">
            一只ucla加州大学毕业的90后学长，只分享能实操、无痛苦的高效学习方法，答疑请私信。系统方法在公号：硬核学长2077
          </span>
        </div>
      </div>

      <div class="w-1/2 flex items-center justify-around gap-10">
        <div class="flex items-center justify-center">
          <div class="flex flex-col items-center justify-center px-3 gap-y-1">
            <p class="text-2xl">960</p>
            <span class="text-xs text-muted">关注数</span>
          </div>

          <a-divider orientation="vertical" />

          <div class="flex flex-col items-center justify-center px-3 gap-y-1">
            <p class="text-2xl">5</p>
            <span class="text-xs text-muted">关注数</span>
          </div>

          <a-divider orientation="vertical" />

          <div class="flex flex-col items-center justify-center px-3 gap-y-1">
            <p class="text-2xl">14</p>
            <span class="text-xs text-muted">关注数</span>
          </div>
        </div>

        <AButton type="text">
          <template #icon>
            <NuxtIcon name="amy:settings-account-box-outline-rounded" size="30" />
          </template>
        </AButton>
      </div>
    </div>

    <div class="w-full h-15 bg-(--ui-bg) border-b border-default/50"></div>
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
