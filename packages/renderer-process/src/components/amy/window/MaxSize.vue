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
  <UButton
    class="no-drag"
    :icon="isFullScreen ? 'amy:restore' : 'amy:full-screen'"
    size="md"
    color="neutral"
    variant="ghost"
    @click="setWindow"
  />
</template>

<style lang="scss"></style>
