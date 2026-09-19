<script setup lang="ts">
import type { Artist } from '@amy/shared/types';

defineProps<{ artist?: Artist; loading?: boolean }>();
</script>

<template>
  <div class="w-full bg-(--ui-bg) flex pt-12 pb-8">
    <div class="flex px-8 gap-x-6 w-1/2">
      <a-skeleton
        class="shrink-0"
        :loading="loading"
        :paragraph="false"
        :avatar="{ shape: 'circle' }"
        active
        :styles="{
          avatar: {
            width: '88px',
            height: 'auto',
            'aspect-ratio': 1,
            display: 'block',
          },
          header: {
            padding: 0,
          },
        }"
        :title="false"
      >
        <a-avatar :size="88" class="shrink-0" :src="artist?.avatar"></a-avatar>
      </a-skeleton>

      <div class="flex flex-col gap-y-3">
        <a-skeleton
          active
          :loading="loading"
          :paragraph="false"
          :styles="{
            title: {
              width: '100%',
            },
          }"
        >
          <p class="text-xl">{{ artist?.name }}</p>
        </a-skeleton>

        <span class="text-toned">
          {{ artist?.description }}
        </span>
      </div>
    </div>

    <div class="w-1/2 flex items-center justify-around gap-10 shrink-0">
      <!-- <div class="flex items-center justify-center">
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
      </div> -->

      <!-- <AButton type="text">
        <template #icon>
          <NuxtIcon name="amy:settings-account-box-outline-rounded" size="30" />
        </template>
      </AButton> -->
    </div>
  </div>
</template>

<style lang="scss"></style>
