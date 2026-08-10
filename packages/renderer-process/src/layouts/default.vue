<script setup lang="ts"></script>

<template>
  <div class="w-full h-full flex">
    <layout-sidebar />

    <div class="main h-full">
      <layout-navbar />

      <layout-main-content />
    </div>
  </div>
</template>

<style lang="scss">
.main {
  width: calc(100% - #{var(--sidebar-width)});
}
</style>
