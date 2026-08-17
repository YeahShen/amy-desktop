<script setup lang="ts">
const hidOrClose = useSettings('hideHomeWindowOrExit');

async function closeWindow() {
  if (hidOrClose.value === 'hide') {
    window.electronAPI.send('hid-window');
  } else {
    window.electronAPI.send('close-window');
  }
}

const userStore = useUserStore();
</script>

<template>
  <div class="w-full navbar drag flex justify-end px-4 z-9999">
    <LayoutSearch />

    <div class="w-fit h-full flex items-center">
      <div class="no-drag">
        <UAvatar size="md" :src="userStore.info?.avatar" icon="i-lucide-image" />
      </div>

      <div class="w-fit h-6 flex px-6">
        <AmyDivider orientation="vertical" size="sm" />
      </div>

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
