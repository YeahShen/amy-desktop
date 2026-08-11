<script setup lang="ts">
const route = useRoute();

console.log(route);

type MenuItem = {
  icon: string;
  title: string;
  path: string;
  workspace: string;
};

const topMenu: MenuItem[] = [
  {
    icon: 'amy:home-2-bold',
    title: 'home',
    path: '/home',
    workspace: 'home',
  },
  {
    icon: 'amy:videocamera-add-bold',
    title: 'film',
    path: '/film',
    workspace: 'film',
  },
  {
    icon: 'amy:photo',
    title: 'photograph',
    path: '/photograph',
    workspace: 'photograph',
  },
  {
    icon: 'amy:cup-star-bold-duotone',
    title: 'artist',
    path: '/artist',
    workspace: 'artist',
  },
];
</script>

<template>
  <div class="sidebar h-full bg-elevated drag flex flex-col">
    <div class="logo-wrap flex items-center justify-center">
      <ClientOnly>
        <div class="logo-sunken w-fit h-fit px-1 py-1 rounded-xl">
          <AmyLogo :animation="false" :size="36" color="var(--ui-text-highlighted)" />
        </div>
      </ClientOnly>
    </div>

    <div class="menu-wrap flex flex-1 w-full flex-col justify-between items-center pt-4">
      <div id="sidebar-top-menu" class="flex items-center flex-col gap-y-5">
        <NuxtLink v-for="item in topMenu" :key="item.path" :to="item.path">
          <div
            class="w-fit h-fit flex items-center justify-center px-1 py-1 rounded text-muted cursor-pointer no-drag"
            :class="{
              'dark:bg-[#1a1a19] bg-white text-primary!': route.meta.workspace === item.workspace,
            }"
          >
            <NuxtIcon :name="item.icon" size="24" />
          </div>
        </NuxtLink>
      </div>

      <div id="sidebar-bottom-menu">
        <AmySwitchColorMode class="no-drag" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.sidebar {
  width: var(--sidebar-width);

  .logo-wrap {
    width: 100%;
    height: var(--navbar-height);
  }
}

/* Logo 容器：向下凹陷、嵌入感。
   顶部内侧阴影（暗）+ 底部内侧高光（亮），模拟光源从上方照射凹陷区域 */
.logo-sunken {
  background: color-mix(in srgb, var(--ui-primary) 5%, transparent);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 -1px 2px rgba(255, 255, 255, 0.5);
}

.dark .logo-sunken {
  // 暗色下主色更亮（primary-400），提高底浓度让凹陷层次可见；阴影加重
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.35),
    inset 0 -1px 2px rgba(255, 255, 255, 0.06);
}
</style>
