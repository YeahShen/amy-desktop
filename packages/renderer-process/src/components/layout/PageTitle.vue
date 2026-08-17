<script setup lang="tsx">
const appStore = useAppStore();
</script>

<template>
  <AmyFadeTransition>
    <div
      v-show="appStore.showNavbarLeftContent"
      class="h-(--navbar-height) w-fit flex items-center absolute top-0 left-0 pl-3"
    >
      <slot />
    </div>
  </AmyFadeTransition>
</template>

<style lang="scss"></style>
