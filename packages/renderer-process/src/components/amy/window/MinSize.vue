<script setup lang="ts">
function click() {
  window.electronAPI.send('min-window');
}
</script>

<template>
  <a-button type="text" class="no-drag" @click="click">
    <template #icon>
      <NuxtIcon name="amy:minus" size="20" />
    </template>
  </a-button>
</template>

<style lang="scss"></style>
