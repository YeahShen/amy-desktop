<script setup lang="ts">
import type { UploadTaskOptions } from '@amy/shared/types';

const alignValue = ref('upload');

defineProps<{
  uploadList: UploadTaskOptions[];
}>();

const options = [
  { value: 'upload', label: '上传列表', icon: h('NuxtIcon', { name: 'amy:add' }) },
  { value: 'upload-finish', label: '上传成功' },
];
</script>

<template>
  <div class="w-full h-full relative">
    <div class="border-b border-muted pt-2 px-2 absolute top-0 left-0 w-full">
      <a-segmented v-model:value="alignValue" style="margin-bottom: 8px" block :options="options" />
    </div>

    <div class="w-full h-[calc(100vh-115px)] relative top-12.25">
      <amy-scrollbar v-show="alignValue === 'upload'" view-class="px-3 py-3 gap-y-3 flex flex-col">
        <transmission-item v-for="item in uploadList" :key="item.id" :item="item" />
      </amy-scrollbar>

      <amy-scrollbar v-show="alignValue === 'upload-finish'"> </amy-scrollbar>
    </div>
  </div>
</template>

<style lang="scss"></style>
