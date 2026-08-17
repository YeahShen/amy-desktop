<script setup lang="ts"></script>

<template>
  <div class="w-full h-full flex">
    <layout-sidebar />

    <div class="main h-full relative">
      <layout-navbar class="absolute top-0 left-0 right-0" />

      <layout-main-content />
    </div>
  </div>
</template>

<style lang="scss">
.main {
  width: calc(100% - #{var(--sidebar-width)});
}
</style>
