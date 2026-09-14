<script setup lang="ts">
import type { UploadTaskOptions } from '@amy/shared/types';

defineProps<{
  uploadList: UploadTaskOptions[];
}>();

const selected = defineModel<string[]>({
  default: () => [],
});

function select(item: UploadTaskOptions, selectOne: boolean) {
  if (selectOne) {
    selected.value = [item.id];
  } else if (selected.value.includes(item.id)) {
    selected.value = selected.value.filter((id) => id !== item.id);
  } else {
    selected.value = [...selected.value, item.id];
  }
}
</script>

<template>
  <amy-scrollbar v-if="uploadList.length" view-class="px-3 py-3 gap-y-0.5 flex flex-col">
    <transmission-item
      v-for="item in uploadList"
      :key="item.id"
      :item="item"
      :selected="selected.includes(item.id)"
      @select="select"
    />
  </amy-scrollbar>

  <div v-else class="w-full h-full flex items-center justify-center">
    <AEmpty
      class="h-full"
      description="暂无上传中的文件"
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
