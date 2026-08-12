<script setup lang="ts">
const hidOrClose = useSettings('hideHomeWindowOrExit');

async function closeWindow() {
  if (hidOrClose.value === 'hide') {
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
      <div class="flex items-center gap-x-4">
        <AmyWindowMinSize />

        <AmyWindowMaxSize />

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
