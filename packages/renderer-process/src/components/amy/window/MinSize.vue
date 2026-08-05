<script setup lang="ts">
function click() {
  window.electronAPI.send('min-window');
}
</script>

<template>
  <UButton
    class="no-drag"
    icon="mdi:minus"
    size="md"
    color="neutral"
    variant="ghost"
    @click="click"
  />
</template>

<style lang="scss"></style>
