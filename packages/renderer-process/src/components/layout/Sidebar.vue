<script setup lang="ts">
const route = useRoute();

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

function openSettingsDialog() {
  openDialog('settings', { width: 700, height: 500 }, false);
}

const sideMode = computed(() => {
  const model = route.meta.sidebarMode ?? 'default';

  if (model === 'frosted') {
    return 'apple-glass';
  }

  if (model === 'immersive') {
    return '';
  }
  return 'bg-elevated';
});
</script>

<template>
  <div class="sidebar h-full drag flex flex-col" :class="[sideMode]">
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
            class="w-fit h-fit flex items-center justify-center px-1 py-1 rounded text-muted cursor-pointer no-drag hover:text-toned"
            :class="{
              'dark:bg-[#1a1a19] bg-white text-primary!': route.meta.workspace === item.workspace,
            }"
          >
            <NuxtIcon :name="item.icon" size="24" />
          </div>
        </NuxtLink>
      </div>

      <div id="sidebar-bottom-menu" class="flex flex-col pb-4 gap-y-2">
        <AmySwitchColorMode class="no-drag" />

        <button class="b-icon no-drag">
          <NuxtIcon name="amy:cloud-check-broken" size="20" />
        </button>

        <button class="b-icon no-drag" @click="openSettingsDialog">
          <NuxtIcon name="amy:settings-line-duotone" size="20" />
        </button>
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

  .b-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 9999px;
    border: none;
    background: transparent;
    color: var(--ui-text-muted);
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;

    &:hover {
      background: color-mix(in srgb, var(--ui-text-dimmed) 40%, transparent);
      color: var(--ui-text);
    }
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

.light {
  .apple-glass {
    /* 1. 背景与透明度：使用带有高透明度的白色 */
    background: rgba(255, 255, 255, 0.25);

    /* 2. 核心：高斯模糊效果，配合饱和度提升（苹果 UI 的鲜艳感） */
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    backdrop-filter: blur(20px) saturate(180%);

    /* 4. 圆角与阴影：大圆角与弥散柔和的深色阴影 */
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);

    /* 5. 补充：防内溢 */
    overflow: hidden;
  }
}

.dark {
  .apple-glass {
    background: rgba(30, 30, 30, 0.45);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    backdrop-filter: blur(20px) saturate(180%);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }
}
</style>
