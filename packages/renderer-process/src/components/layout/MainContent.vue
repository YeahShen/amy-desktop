<script setup lang="ts"></script>

<template>
  <div class="w-full main-content relative">
    <AmyScrollbar>
      <NuxtPage />
    </AmyScrollbar>
  </div>
</template>

<style lang="scss">
.main-content {
  height: calc(100% - #{var(--navbar-height)});
}
</style>
