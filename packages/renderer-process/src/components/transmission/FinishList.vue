<script setup lang="ts">
import type { UploadTaskOptions } from '@amy/shared/types';

defineProps<{
  finishList: UploadTaskOptions[];
}>();
</script>

<template>
  <amy-scrollbar v-if="finishList.length" view-class="px-3 py-3 gap-y-3 flex flex-col">
    <transmission-finish-item v-for="item in finishList" :key="item.id" :item="item" />
  </amy-scrollbar>

  <AEmpty v-else class="h-full" description="暂无上传成功的文件" />
</template>

<style lang="scss"></style>
