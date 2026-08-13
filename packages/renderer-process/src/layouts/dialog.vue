<script setup lang="ts">
const route = useRoute();
const meta = computed(() => route.meta.dialog);

const title = computed(() => meta.value?.title ?? '');
const subtitle = computed(() => meta.value?.subtitle);
const minSizeAble = computed(() => meta.value?.minSizeAble ?? false);

const { close } = useDialog();
</script>

<template>
  <div class="w-full h-full flex flex-col bg-container text-default">
    <!-- 标题栏（可拖拽区域） -->
    <header class="shrink-0 drag flex items-center justify-between gap-4 h-15 px-4">
      <div class="min-w-0 flex flex-col justify-center gap-1">
        <h5 class="truncate leading-tight text-sm font-medium">
          {{ title }}
        </h5>
        <p v-if="subtitle" class="truncate leading-tight text-xs text-muted">
          {{ subtitle }}
        </p>
      </div>

      <div class="no-drag shrink-0 flex items-center">
        <AmyWindowMinSize v-if="minSizeAble" />
        <AmyWindowClose @close="close" />
      </div>
    </header>

    <main class="min-h-0 flex-1">
      <slot />
    </main>

    <footer id="layout-dialog-footer" class="shrink-0 w-full h-fit"></footer>
  </div>
</template>
