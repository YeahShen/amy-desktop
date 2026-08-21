<script setup lang="tsx">
const appStore = useAppStore();
</script>

<template>
  <AmyFadeTransition>
    <div
      v-show="appStore.showNavbarLeftContent"
      class="w-fit absolute top-0 title-wrap left-0 flex items-center px-4"
    >
      <slot />
    </div>
  </AmyFadeTransition>
</template>

<style lang="scss">
.title-wrap {
  height: var(--navbar-height);
}
</style>
