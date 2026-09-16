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
  <div class="w-full navbar drag flex justify-end px-4 z-10 absolute">
    <div class="inset-x-0 isolate navbar absolute top-0 left-0">
      <div
        style="-webkit-backdrop-filter: blur(1px); backdrop-filter: blur(1px); opacity: 1"
        class="absolute inset-0 bg-(--ui-bg)/3 gradient-mask-b-0"
      ></div>
      <div
        style="-webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); opacity: 1"
        class="absolute inset-0 bg-(--ui-bg)/3 gradient-mask-b-0"
      ></div>
      <div
        style="-webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); opacity: 1"
        class="absolute inset-0 bg-(--ui-bg)/3 gradient-mask-b-0"
      ></div>
      <div
        style="-webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); opacity: 1"
        class="absolute inset-0 bg-(--ui-bg)/3 gradient-mask-b-0"
      ></div>
      <div
        style="-webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); opacity: 1"
        class="absolute inset-0 bg-(--ui-bg)/3 gradient-mask-b-0"
      ></div>
    </div>

    <LayoutSearch />

    <div class="w-fit h-full flex items-center">
      <div class="no-drag">
        <a-avatar :src="userStore.info?.avatar">
          <template #icon>
            <div></div>
          </template>
        </a-avatar>
      </div>

      <div class="w-fit h-6 flex px-6 items-center">
        <a-divider orientation="vertical" />
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

.gradient-mask-b-0 {
  mask-image: linear-gradient(180deg, #000 0, transparent);
}
</style>
