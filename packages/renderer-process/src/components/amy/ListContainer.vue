<script setup lang="ts" generic="T">
const {
  sideWidth,
  gapX,
  gapY,
  loading,
  list,
  loadingRowNumber,
  itemClasses = '',
  columnCount,
} = defineProps<{
  sideWidth: number;
  gapX: number;
  gapY: number;
  list: T[];
  loading: boolean;
  /** 加载时骨架占用的行数（每行按实际列数渲染） */
  loadingRowNumber: number;
  itemClasses?: string;
  columnCount: number;
}>();

const emits = defineEmits<{
  select: [item: T];
}>();

const gridStyle = computed(() => {
  return {
    padding: `0 ${sideWidth}px`,
    'grid-template-columns': `repeat(${columnCount}, minmax(0, 1fr))`,
    'column-gap': `${gapX}px`,
    'row-gap': `${gapY}px`,
  };
});

const renderList = computed<T[]>(() => {
  if (loading) {
    return Array.from({ length: loadingRowNumber * columnCount }).fill({}) as T[];
  }
  return list;
});
</script>

<template>
  <div ref="wrap" class="w-full h-fit">
    <div :style="gridStyle" class="grid">
      <div
        v-for="(i, idx) in renderList"
        :key="idx"
        :class="itemClasses"
        @click="!loading && emits('select', i)"
      >
        <div w-full h-fit>
          <slot name="item" :item="i" :loading="loading"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
