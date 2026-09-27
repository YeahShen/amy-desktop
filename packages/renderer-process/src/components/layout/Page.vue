<script setup lang="ts">
const route = useRoute();

const immersiveHeader = computed(() => route.meta.immersiveHeader);
</script>

<template>
  <AmyScrollbar track-class="common-content_track">
    <div :class="{ tp: !immersiveHeader }" class="w-full min-h-screen">
      <slot />
    </div>
  </AmyScrollbar>
</template>

<style lang="scss">
.tp {
  padding-top: var(--navbar-height);
}
</style>
