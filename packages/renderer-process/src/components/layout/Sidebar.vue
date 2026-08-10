<script setup lang="ts">
const colorMode = useColorMode();
</script>

<template>
  <div class="sidebar h-full bg-[#f6f7f8] drag dark:bg-[#161717]">
    <div class="logo-wrap flex items-center justify-center">
      <ClientOnly>
        <AmyLogo color="red" :animation="false" size="36" />
      </ClientOnly>
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
</style>
