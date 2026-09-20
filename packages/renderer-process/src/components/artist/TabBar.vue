<script setup lang="ts">
import type { TabsProps } from 'antdv-next';

defineProps<{
  loading: boolean;
}>();

const activeTab = defineModel<string>({
  default: 'video',
});

const items: TabsProps['items'] = [
  {
    key: 'video',
    label: '视频',
  },
  {
    key: 'serial',
    label: '合集',
  },
  {
    key: 'phot',
    label: '相册',
  },
];

function change(item: any) {
  activeTab.value = item;
}
</script>

<template>
  <ASkeleton
    :loading="loading"
    :title="false"
    :avatar="false"
    :paragraph="{ rows: 3 }"
    :classes="{ paragraph: 'flex justify-start items-center tabs-loading-skeleton' }"
  >
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
      @change="change"
    />
  </ASkeleton>
</template>

<style lang="scss">
.artist-tabs {
  .ant-tabs-nav {
    &::before {
      border-color: var(--ui-border-accented);
    }
  }
}

.tabs-loading-skeleton {
  padding: 8px 30px !important;
  column-gap: 32px !important;
  li {
    width: 30px !important;
    margin: 0 !important;
    height: 24px !important;
  }
}
</style>
