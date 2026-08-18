<script setup lang="ts">
const isFullScreen = ref(false);

onMounted(() => {
  window.electronAPI.on<boolean>('window-size-state', (isFull) => {
    isFullScreen.value = isFull;
  });
});

function setWindow() {
  if (!isFullScreen.value) {
    window.electronAPI.send('max-window');
  } else {
    window.electronAPI.send('restore-window');
  }
}
</script>

<template>
  <a-button type="text" class="no-drag" @click="setWindow">
    <template #icon>
      <NuxtIcon :name="isFullScreen ? 'amy:restore' : 'amy:full-screen'" size="20" />
    </template>
  </a-button>
</template>

<style lang="scss"></style>
