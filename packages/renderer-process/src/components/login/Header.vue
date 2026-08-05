<script setup lang="ts">
function closeWindow() {
  window.electronAPI.send('close-window');
}
</script>

<template>
  <div class="w-full flex items-center justify-end h-15 px-3 gap-x-4 drag">
    <AmyWindowMinSize />
    <AmyWindowClose @close="closeWindow" />
  </div>
</template>

<style lang="scss"></style>
