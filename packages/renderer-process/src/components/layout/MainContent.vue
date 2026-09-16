<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <div class="w-full relative h-full" :class="[{ 'common-content': !route.meta.immersiveHeader }]">
    <AmyScrollbar track-class="common-content_track">
      <NuxtPage />
    </AmyScrollbar>
  </div>
</template>

<style lang="scss">
.common-content {
  padding-top: var(--navbar-height);

  &_track {
    padding-top: var(--navbar-height);
  }
}
</style>
