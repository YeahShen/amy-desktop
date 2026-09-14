<script setup lang="ts">
import type { UploadTaskOptions } from '@amy/shared/types';

import dayjs from 'dayjs';

const { item } = defineProps<{
  item: UploadTaskOptions;
  selected: boolean;
}>();

const emits = defineEmits<{
  select: [UploadTaskOptions, boolean];
}>();

function formatSizeUnits(kb: number): string {
  kb = kb / 1000;
  const units: string[] = ['KB', 'MB', 'GB', 'TB'];
  let unitIndex: number = 0;
  let size: number = kb;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

const status = computed(() => {
  if (item.status === 'finish') {
    return '已完成';
  }
  if (item.status === 'conversion') {
    return '转码中';
  }
  return '';
});

const statusTextColor = computed(() => {
  if (item.status === 'conversion') {
    return 'text-info';
  }
  if (item.status === 'error') {
    return 'text-error';
  }
  return '';
});

function handleClick(event: MouseEvent) {
  emits('select', item, !event.ctrlKey);
}
</script>

<template>
  <div
    class="w-full flex px-2 rounded-lg gap-x-3 h-18 items-center hover:bg-primary-bg-hover/20 transform"
    :class="[{ 'bg-primary-active/20!': selected }]"
    @click="handleClick"
  >
    <div>
      <NuxtIcon name="amy:video-file" size="40" />
    </div>

    <div class="flex-1 flex flex-col justify-between h-full pt-3 pb-2 pr-3">
      <p class="line-clamp-1 text-default">{{ item.title }}</p>

      <div class="w-ful flex text-xs py-1.5 text-toned justify-start gap-x-2">
        <p :class="statusTextColor">{{ status }}</p>

        <p>{{ formatSizeUnits(item.size) }}</p>

        <p v-if="item.finishTime">{{ dayjs(item.finishTime).format('YYYY-MM-DD HH:mm') }}</p>
      </div>
    </div>

    <div class="flex items-center gap-x-3">
      <AButton type="text">
        <template #icon>
          <NuxtIcon
            name="amy:play-circle-outlined"
            size="20"
            class="text-text-quaternary hover:text-primary-text"
          />
        </template>
      </AButton>

      <AButton type="text">
        <template #icon>
          <NuxtIcon
            name="amy:delete-outlined"
            class="text-text-quaternary hover:text-primary-text"
            size="20"
          />
        </template>
      </AButton>
    </div>
  </div>
</template>

<style lang="scss"></style>
