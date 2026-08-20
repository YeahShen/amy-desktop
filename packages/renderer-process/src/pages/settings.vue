<script setup lang="ts">
definePageMeta({
  layout: 'dialog',
  dialog: {
    title: '设置',
    minSizeAble: true,
  },
});

const menus = [
  {
    key: 1,
    icon: 'amy:shield-user-bold',
    title: '账户设置',
  },
  {
    key: 2,
    icon: 'amy:settings-bold-duotone',
    title: '通用设置',
  },
  {
    key: 3,
    icon: 'amy:bag-heart-bold-duotone',
    title: '关于 AMY Station',
  },
];

const selectedKey = ref(1);
</script>

<template>
  <div class="w-full h-full px-4 flex">
    <div class="w-45 flex flex-col gap-y-1">
      <div
        v-for="item in menus"
        :key="item.key"
        :class="{ 'bg-primary-active!': selectedKey === item.key }"
        class="w-full h-10 flex items-center rounded-xl px-3 gap-x-1 cursor-pointer hover:bg-primary-bg-hover/20 transition-all"
        @click="selectedKey = item.key"
      >
        <NuxtIcon :name="item.icon" size="18" />
        <p>{{ item.title }}</p>
      </div>
    </div>

    <div class="flex-1">
      <AmyScrollbar>
        <div class="w-full px-4 pb-5">
          <SettingUserProfile v-if="selectedKey === 1" />
          <SettingCommon v-else-if="selectedKey === 2" />
          <SettingAbout v-else />
        </div>
      </AmyScrollbar>
    </div>
  </div>
</template>

<style lang="scss"></style>
