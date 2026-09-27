<script setup lang="tsx">
useAppStore();
</script>

<template>
  <div class="w-full h-full flex bg-(--ui-bg)">
    <LayoutSidebar />

    <div class="main h-full relative">
      <LayoutNavbar />

      <!-- <AmyScrollbar track-class="common-content_track" :disabled="appStore.disableScrollbar">
        <NuxtPage />
      </AmyScrollbar> -->

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
