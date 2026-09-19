<script setup lang="ts">
import type { TabsProps } from 'antdv-next';

const items: TabsProps['items'] = [
  {
    key: '1',
    label: '视频',
  },
  {
    key: '2',
    label: '合集',
  },
  {
    key: '3',
    label: '相册',
  },
];
</script>

<template>
  <a-tabs
    class="artist-tabs"
    :items="items"
    :indicator="{
      size: 24,
    }"
    size="small"
    :classes="{
      header: 'before:border-red-500',
    }"
    :styles="{
      body: {
        display: 'none',
      },
      header: {
        margin: '0',
        padding: '0 30px',
      },
      root: {
        width: '100%',
      },
      item: {
        padding: '8px 0',
        fontSize: '14px',
      },
      indicator: {
        borderRadius: '50%',
      },
    }"
  />
</template>

<style lang="scss">
.artist-tabs {
  .ant-tabs-nav {
    &::before {
      border-color: var(--ui-border-accented);
    }
  }
}
</style>
