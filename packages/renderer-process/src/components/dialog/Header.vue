<script setup lang="ts">
const route = useRoute();
const { close } = useDialog();

const emits = defineEmits<{
  close: [];
}>();

/** 页面 definePageMeta({ dialog }) 声明的弹窗配置 */
const dialogMeta = computed(() => route.meta.dialog);
const title = computed(() => dialogMeta.value?.title ?? '');
const subtitle = computed(() => dialogMeta.value?.subtitle);
const minSizeAble = computed(() => dialogMeta.value?.minSizeAble ?? false);
const customCloseWindowFn = computed(() => dialogMeta.value?.customCloseWindowFn ?? false);

function handleClose() {
  // 自定义关闭：交由页面处理（如携带结果 closeDialog），否则直接关闭弹窗
  if (customCloseWindowFn.value) {
    emits('close');
  } else {
    close();
  }
}
</script>

<template>
  <div class="w-full h-16 shrink-0 drag flex items-center justify-between px-4">
    <div class="flex items-baseline gap-x-1.5 min-w-0 flex-col gap-y-1">
      <span class="text-[15px] font-medium truncate">{{ title }}</span>
      <span v-if="subtitle" class="text-xs text-muted truncate">{{ subtitle }}</span>
    </div>

    <div class="flex items-center gap-x-3">
      <AmyWindowMinSize v-if="minSizeAble" />
      <AmyWindowClose @close="handleClose" />
    </div>
  </div>
</template>

<style lang="scss"></style>
