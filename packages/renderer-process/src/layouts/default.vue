<script setup lang="tsx"></script>

<template>
  <div class="w-full h-full flex bg-(--ui-bg)">
    <LayoutSidebar />

    <div class="main h-full relative">
      <LayoutNavbar />

      <LayoutMainContent />
    </div>

    <LayoutDrawer />
  </div>
</template>

<style lang="scss">
.main {
  width: calc(100% - #{var(--sidebar-width)});
}
</style>
