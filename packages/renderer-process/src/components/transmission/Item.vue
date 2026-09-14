<script setup lang="ts">
import type { UploadTaskOptions } from '@amy/shared/types';

const { item } = defineProps<{
  item: UploadTaskOptions;
  selected?: boolean;
}>();

const playIcon = computed(() => {
  if (item.status === 'pause') return 'amy:arrow-down-outlined';
  return 'amy:pause-outlined';
});

const emits = defineEmits<{
  select: [UploadTaskOptions, boolean];
}>();

async function start() {
  if (item.status === 'pause') {
    await window.electronAPI.invoke('start-upload-task', item.id);
  } else {
    await window.electronAPI.invoke('pause-upload-task', item.id);
  }
}

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

const percent = computed(() => (item.progressRate || 0) * 100);

const uploadedSize = computed(() => {
  const sz = item.uploadedChunk.length * item.chunkSize;
  return formatSizeUnits(sz);
});

const status = computed(() => {
  if (item.status === 'uploading') {
    return '上传中';
  }
  if (item.status === 'wait') {
    return '等待';
  }
  if (item.status === 'error') {
    return '上传失败';
  }
  if (item.status === 'pause') {
    return '暂停';
  }
  return '';
});

function handleClick(event: any) {
  if (event.ctrlKey) {
    emits('select', item, false);
    // 你的逻辑
  } else {
    emits('select', item, true);
  }
}
</script>

<template>
  <div
    class="w-full flex px-2 rounded-lg gap-x-3 h-21 items-center hover:bg-primary-bg-hover/20 transform"
    :class="{ 'bg-primary-active/20!': selected }"
    @click="handleClick"
  >
    <div>
      <NuxtIcon name="amy:video-file" size="45" />
    </div>

    <div class="flex-1 flex flex-col justify-between h-full pt-3 pb-3 pr-3">
      <p class="line-clamp-1 text-default">
        {{ item.title }}
      </p>

      <div class="w-ful flex flex-col">
        <div class="flex items-center text-xs py-1.5 text-muted justify-between">
          <p>{{ uploadedSize }}/{{ formatSizeUnits(item.size) }}</p>

          <p>{{ status }}</p>
        </div>

        <a-progress
          :percent="percent"
          :show-info="false"
          :stroke-color="
            item.status === 'uploading' ? 'var(--ant-color-primary)' : 'var(--ui-text-dimmed)'
          "
        />
      </div>
    </div>

    <div class="flex items-center gap-x-3">
      <AButton type="text">
        <template #icon>
          <NuxtIcon
            name="amy:folder-open-outline"
            size="20"
            class="text-text-quaternary hover:text-primary-text"
          />
        </template>
      </AButton>

      <AButton type="text" @click="start">
        <template #icon>
          <NuxtIcon
            :name="playIcon"
            class="text-text-quaternary hover:text-primary-text"
            size="20"
          />
        </template>
      </AButton>
    </div>
  </div>
</template>

<style lang="scss"></style>
