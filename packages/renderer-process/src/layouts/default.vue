<script setup lang="tsx">
useAppStore();

const searching = ref<boolean>(false);

provide(SEARCHING_INJECTION_KEY, searching);
</script>

<template>
  <div class="w-full h-full flex bg-(--ui-bg)">
    <LayoutSidebar />

    <div class="main h-full relative">
      <LayoutNavbar v-model:searching="searching" />

      <NuxtPage />
    </div>

    <LayoutDrawer />
  </div>
</template>

<style lang="scss">
.main {
  width: calc(100% - #{var(--sidebar-width)});
}
</style>
