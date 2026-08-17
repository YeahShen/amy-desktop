<script setup lang="ts">
definePageMeta({
  layout: 'dialog',
  dialog: {
    title: '设置',
    minSizeAble: true,
  },
});

const menu = ref([
  {
    key: 1,
    label: '账号管理',
    icon: 'amy:shield-user-bold',
  },
  {
    key: 2,
    label: '通用设置',
    icon: 'amy:settings-bold-duotone',
  },
  {
    key: 3,
    label: '关于 AMY STATION',
    icon: 'amy:bag-heart-bold-duotone',
  },
]);

const selectedKey = ref(1);
</script>

<template>
  <div class="w-full h-full flex">
    <div class="w-50 h-full px-2 flex flex-col gap-1">
      <div
        v-for="item in menu"
        :key="item.key"
        class="w-full h-10 flex rounded-xl items-center px-3 text-sm cursor-pointer gap-x-2 hover:bg-primary-100/10"
        :class="{ 'bg-primary/80!': item.key === selectedKey }"
        @click="selectedKey = item.key"
      >
        <NuxtIcon :name="item.icon" size="18" />
        <p>{{ item.label }}</p>
      </div>
    </div>

    <div class="flex-1 h-full relative">
      <AmyScrollbar>
        <div class="w-full h-fit pl-4 pr-4 pb-4">
          <SettingsUserProfile v-if="selectedKey === 1" />
          <SettingsCommon v-else-if="selectedKey === 2" />
          <SettingsAbout v-else />
        </div>
      </AmyScrollbar>
    </div>
  </div>
</template>

<style lang="scss"></style>
