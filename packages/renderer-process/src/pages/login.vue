<script setup lang="ts">
definePageMeta({
  layout: 'empty',
  colorMode: 'light',
});
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <LoginHeader />

    <div class="flex w-full gap-x-2 justify-center text-2xl title mt-3">
      <span class="text-primary font-bold">Amy</span>
      <span class="font-bold">Station</span>
    </div>
  </div>
</template>

<style lang="scss">
.title {
  font-family: Orbitron, sans-serif;
}
</style>
