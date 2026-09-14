<script setup lang="ts">
import type { UploadTaskOptions } from '@amy/shared/types';

import FinishList from './FinishList.vue';
import UploadList from './UploadList.vue';

const alignValue = ref('upload');

defineProps<{
  uploadList: UploadTaskOptions[];
  finishList: UploadTaskOptions[];
}>();

const options = [
  { value: 'upload', label: '上传列表', icon: h('NuxtIcon', { name: 'amy:add' }) },
  { value: 'upload-finish', label: '已上传' },
];
</script>

<template>
  <div class="w-full h-full relative">
    <div
      class="border-b border-muted pt-2 px-2 absolute top-0 left-0 w-full flex items-center justify-between"
    >
      <div class="w-2/3 z-10">
        <a-segmented
          v-model:value="alignValue"
          style="margin-bottom: 8px"
          block
          :options="options"
        />
      </div>

      <div class="flex items-center pb-2 pr-3 gap-x-4">
        <a-button text-text-color="var(--ui-text-muted)">
          <template #icon>
            <nuxt-icon
              name="amy:cloud-upload-outlined"
              size="20"
              class="text-text-quaternary hover:text-primary-text"
            />
          </template>
        </a-button>

        <a-button>
          <template #icon>
            <nuxt-icon
              name="amy:pause-outlined"
              size="20"
              class="text-text-quaternary hover:text-primary-text"
            />
          </template>
        </a-button>

        <a-button>
          <template #icon>
            <nuxt-icon
              name="amy:delete-outlined"
              size="20"
              class="text-text-quaternary hover:text-primary-text"
            />
          </template>
        </a-button>
      </div>
    </div>

    <div class="w-full h-[calc(100vh-115px)] relative top-12.25">
      <amy-fade-transition>
        <component
          :is="alignValue === 'upload' ? UploadList : FinishList"
          :upload-list="uploadList"
          :finish-list="finishList"
        />
      </amy-fade-transition>
    </div>
  </div>
</template>

<style lang="scss"></style>
