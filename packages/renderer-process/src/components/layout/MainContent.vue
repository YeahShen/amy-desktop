<script setup lang="ts"></script>

<template>
  <div class="w-full main-content relative">
    <AmyScrollbar track-class="main-content_track">
      <NuxtPage />
    </AmyScrollbar>
  </div>
</template>

<style lang="scss">
.main-content {
  height: calc(100% - #{var(--navbar-height)});
  padding-top: var(--navbar-height);

  &_track {
    padding-top: var(--navbar-height);
  }
}
</style>
