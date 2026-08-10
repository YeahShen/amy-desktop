<script setup lang="ts">
async function closeWindow() {
  if ((await getSetting('hideHomeWindowOrExit')) === 'hide') {
    window.electronAPI.send('hid-window');
  } else {
    window.electronAPI.send('close-window');
  }
}
</script>

<template>
  <div class="w-full navbar drag flex justify-between px-4">
    <div class="w-fit h-full"></div>
    <div class="w-fit h-full flex">
      <div class="flex items-center">
        <AmyWindowClose @close="closeWindow" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.navbar {
  height: var(--navbar-height);
}
</style>
