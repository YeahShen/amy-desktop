<script setup lang="ts">
defineProps<{
  immersiveHeader?: boolean;
}>();
</script>

<template>
  <div :class="{ tp: !immersiveHeader }" class="w-full min-h-screen">
    <slot />
  </div>
</template>

<style lang="scss">
.tp {
  padding-top: var(--navbar-height);
}
</style>
