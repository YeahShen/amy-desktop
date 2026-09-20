<script setup lang="ts">
defineProps<{
  title?: string;
}>();

function closeWindow() {
  window.electronAPI.send('close-window');
}
</script>

<template>
  <div class="w-full h-14 flex items-center justify-between bg-[#1e2022] px-4 drag">
    <p>{{ title }}</p>

    <div class="flex items-center gap-x-4 text-white">
      <AmyWindowMinSize />

      <AmyWindowMaxSize />

      <AmyWindowClose @close="closeWindow" />
    </div>
  </div>
</template>

<style lang="scss"></style>
