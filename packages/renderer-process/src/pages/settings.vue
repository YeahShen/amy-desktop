<script setup lang="ts">
import UserProfile from '~/components/settings/UserProfile.vue';
import Common from '~/components/settings/Common.vue';
import About from '~/components/settings/About.vue';

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
    component: UserProfile,
  },
  {
    key: 2,
    label: '通用设置',
    icon: 'amy:settings-bold-duotone',
    component: Common,
  },
  {
    key: 3,
    label: '关于 AMY STATION',
    icon: 'amy:bag-heart-bold-duotone',
    component: About,
  },
]);

const selectedKey = ref(1);
const selectComponent = computed(
  () => menu.value.find((i) => i.key === selectedKey.value)?.component,
);
</script>

<template>
  <div class="w-full h-full flex">
    <nav class="w-50 shrink-0 h-full px-2 py-2 flex flex-col gap-1" aria-label="设置分类">
      <button
        v-for="item in menu"
        :key="item.key"
        type="button"
        class="w-full h-10 flex rounded-xl items-center px-3 text-sm gap-x-2 cursor-pointer select-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="
          item.key === selectedKey
            ? 'bg-primary/80 text-inverted hover:bg-primary/90'
            : 'text-default hover:bg-primary-100/10 hover:text-toned'
        "
        :aria-current="item.key === selectedKey ? 'true' : undefined"
        @click="selectedKey = item.key"
      >
        <NuxtIcon :name="item.icon" size="18" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <div class="flex-1 h-full relative min-w-0">
      <AmyScrollbar>
        <div class="w-full h-fit pl-4 pr-4 pb-4">
          <AmyFadeTransition>
            <KeepAlive>
              <component :is="selectComponent" :key="selectedKey" />
            </KeepAlive>
          </AmyFadeTransition>
        </div>
      </AmyScrollbar>
    </div>
  </div>
</template>

<style lang="scss"></style>