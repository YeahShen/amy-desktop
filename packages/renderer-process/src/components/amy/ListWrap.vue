<script setup lang="ts" generic="T">
import { useElementSize } from '@vueuse/core';

const { sideWidth, gapX, gapY, itemMinWidth, loading, list, loadingRowNumber } = defineProps<{
  itemMinWidth: number;
  sideWidth: number;
  gapX: number;
  gapY: number;
  list: T[];
  loading: boolean;
  /** 加载时骨架占用的行数（每行按实际列数渲染） */
  loadingRowNumber: number;
}>();

const wrapRef = useTemplateRef('wrap');
const { width } = useElementSize(wrapRef);

const emits = defineEmits<{
  select: [item: T];
}>();

/**
 * 一行能容纳的最大列数，解不等式：
 *   n * itemMinWidth + (n - 1) * gapX + 2 * sideWidth <= width
 *   => n = floor((width - 2 * sideWidth + gapX) / (itemMinWidth + gapX))
 */
const columnCount = computed(() => {
  if (!width.value) {
    return 0;
  }

  return Math.max(
    1,
    Math.floor((width.value - sideWidth * 2 + gapX) / Math.max(1, itemMinWidth + gapX)),
  );
});

const gridStyle = computed(() => {
  return {
    padding: `0 ${sideWidth}px`,
    'grid-template-columns': `repeat(${columnCount.value}, minmax(0, 1fr))`,
    'column-gap': `${gapX}px`,
    'row-gap': `${gapY}px`,
  };
});

const renderList = computed<T[]>(() => {
  if (loading) {
    return Array.from({ length: loadingRowNumber * columnCount.value }).fill({}) as T[];
  }
  return list;
});
</script>

<template>
  <div ref="wrap" class="w-full h-fit">
    <div :style="gridStyle" class="grid">
      <div v-for="(i, idx) in renderList" :key="idx" @click="!loading && emits('select', i)">
        <div w-full h-fit>
          <slot name="item" :item="i" :loading="loading"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
