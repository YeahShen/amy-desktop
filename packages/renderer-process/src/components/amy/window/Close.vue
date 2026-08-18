<script setup lang="tsx">
const emits = defineEmits<{
  close: [];
}>();
</script>

<template>
  <a-button type="text" class="no-drag" @click="emits('close')">
    <template #icon>
      <NuxtIcon name="amy:window-close" size="20" />
    </template>
  </a-button>
</template>

<style lang="scss"></style>
