<script setup lang="tsx" generic="T">
import { useElementSize } from '@vueuse/core';

const { sideWidth, gapX, gapY, itemMinWidth, loading, list } = defineProps<{
  itemMinWidth: number;
  sideWidth: number;
  gapX: number;
  gapY: number;
  list: T[];
  loading: boolean;
}>();

const wrapRef = useTemplateRef('wrap');
const baseItemNumber = 3;
const { width } = useElementSize(wrapRef);

const rowItemNumber = computed(() => {
  if (!width.value) {
    return 0;
  }

  let isOver = true;
  let itemNum = baseItemNumber;
  while (isOver) {
    const gapNum = itemNum - 1;

    const gapWidth = gapNum * gapX;
    const itemWidth = itemNum * itemMinWidth;

    const totalWidth = itemWidth + gapWidth + sideWidth * 2;

    if (width.value > totalWidth) {
      itemNum = itemNum + 1;
    } else {
      isOver = false;
    }
  }

  return itemNum - 1;
});

const warpStyle = computed(() => {
  return {
    padding: `0 ${sideWidth}px`,
    'grid-template-columns': `repeat(${rowItemNumber.value}, minmax(0, 1fr))`,
    'column-gap': `${gapX}px`,
    'row-gap': `${gapY}px`,
  };
});

const renderList = computed<T[]>(() => {
  if (loading) {
    return Array.from({ length: 10 * rowItemNumber.value }).fill({}) as T[];
  }
  return list;
});
</script>

<template>
  <div ref="wrap" class="w-full h-fit">
    <div :style="warpStyle" class="grid" grid-cols-4>
      <div v-for="(i, idx) in renderList" :key="idx">
        <div w-full h-fit>
          <slot name="item" :item="i" :loading="loading"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
