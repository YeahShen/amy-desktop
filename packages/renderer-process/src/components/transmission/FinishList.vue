<script setup lang="ts">
import type { UploadTaskOptions } from '@amy/shared/types';

defineProps<{
  finishList: UploadTaskOptions[];
}>();
</script>

<template>
  <amy-scrollbar v-if="finishList.length" view-class="px-3 py-3 gap-y-1 flex flex-col">
    <transmission-finish-item v-for="item in finishList" :key="item.id" :item="item" />
  </amy-scrollbar>

  <div v-else class="w-full h-full flex items-center justify-center">
    <AEmpty
      class="h-full"
      description="暂无上传成功的文件"
      :classes="{
        root: 'flex flex-col items-center justify-center h-full relative bottom-10',
      }"
    >
      <template #image>
        <AmyLogo color="var(--ui-text-dimmed)" :animation="false" size="90" class="opacity-85" />
      </template>
    </AEmpty>
  </div>
</template>

<style lang="scss"></style>
