<script setup lang="ts">
const props = defineProps<{
  immersiveHeader?: boolean;
}>();

const classes = computed(() => {
  const v = ['w-full'];

  if (props.immersiveHeader) {
    v.push('h-main-content');
  }
  return v;
});
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<style lang="scss"></style>
