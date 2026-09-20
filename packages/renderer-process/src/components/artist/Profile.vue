<script setup lang="ts">
import type { Artist } from '@amy/shared/types';

defineProps<{ artist?: Artist; loading?: boolean }>();

const classes = {
  root: 'skeleton-root',
  header: 'skeleton-header',
};

function stylesFn(info: { props: { active?: boolean } }) {
  if (info.props?.active) {
    return {
      root: {},
      title: {
        backgroundColor: 'rgba(229, 243, 254, 0.5)',
        height: '20px',
        borderRadius: '20px',
      },
    };
  }
  return {};
}
</script>

<template>
  <div class="w-full bg-(--ui-bg) flex pt-12 pb-8">
    <div class="flex px-8 gap-x-6 w-1/2">
      <a-skeleton
        class="shrink-0 w-22! h-22!"
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

      <div class="flex flex-col gap-y-3 flex-1">
        <a-skeleton
          :classes="{ ...classes, paragraph: 'skeleton-paragraph' }"
          :styles="stylesFn"
          :loading="loading"
          active
        >
          <p class="text-xl">{{ artist?.name }}</p>

          <a-tooltip placement="bottomLeft" :title="artist?.description" :max-width="450">
            <span class="text-toned line-clamp-2">
              {{ artist?.description }}
            </span>
          </a-tooltip>
        </a-skeleton>
      </div>
    </div>

    <div class="w-1/2 flex items-center justify-around gap-10 shrink-0">
      <div class="flex items-center justify-center">
        <div class="w-25 px-6">
          <a-skeleton
            :paragraph="{ rows: 2 }"
            :title="false"
            :loading="loading"
            :classes="{ paragraph: 'flex justify-center items-center flex-col' }"
          >
            <div class="flex flex-col items-center justify-center px-3 gap-y-1">
              <p class="text-2xl text-nowrap">0</p>
              <span class="text-xs text-muted text-nowrap">关注数</span>
            </div>
          </a-skeleton>
        </div>

        <a-divider orientation="vertical" class="mx-6" />

        <div class="w-25 px-6">
          <a-skeleton
            :paragraph="{ rows: 2 }"
            :title="false"
            :loading="loading"
            :classes="{ paragraph: 'flex justify-center items-center flex-col' }"
          >
            <div class="flex flex-col items-center justify-center px-3 gap-y-1">
              <p class="text-2xl text-nowrap">0</p>
              <span class="text-xs text-muted text-nowrap">关注数</span>
            </div>
          </a-skeleton>
        </div>

        <a-divider orientation="vertical" class="mx-6" />

        <div class="w-25 px-6">
          <a-skeleton
            :paragraph="{ rows: 2 }"
            :title="false"
            :loading="loading"
            :classes="{ paragraph: 'flex justify-center items-center flex-col' }"
          >
            <div class="flex flex-col items-center justify-center px-3 gap-y-1">
              <p class="text-2xl text-nowrap">0</p>
              <span class="text-xs text-muted text-nowrap">关注数</span>
            </div>
          </a-skeleton>
        </div>
      </div>

      <ASkeleton
        :loading="loading"
        :paragraph="false"
        :title="false"
        :avatar="{ shape: 'square' }"
        class="w-7.5! h-7.5!"
      >
        <AButton type="text">
          <template #icon>
            <NuxtIcon name="amy:settings-account-box-outline-rounded" size="30" />
          </template>
        </AButton>
      </ASkeleton>
    </div>
  </div>
</template>

<style lang="scss">
.skeleton-paragraph {
  li {
    &:first-child {
      display: none;
    }
  }
}
</style>
