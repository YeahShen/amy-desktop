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

const route = useRoute();

const immersiveHeader = computed(() => route.meta.immersiveHeader);
</script>

<template>
  <div
    class="w-full navbar drag flex justify-end px-4 z-10 absolute"
    :class="{ 'bg-(--ui-bg)': !immersiveHeader }"
  >
    <LayoutSearch class="z-12" />

    <div class="w-fit h-full flex items-center z-12">
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
</style>
