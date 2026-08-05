<script setup lang="ts">
const emits = defineEmits<{
  close: [];
}>();
</script>

<template>
  <UButton
    icon="mdi:window-close"
    size="md"
    variant="ghost"
    color="neutral"
    class="no-drag"
    @click="emits('close')"
  />
</template>

<style lang="scss"></style>
