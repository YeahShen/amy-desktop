<script setup lang="ts"></script>

<template>
  <Teleport to="#layout-navbar-left-context">
    <div class="w-fit h-fit no-drag">
      <slot />
    </div>
  </Teleport>
</template>

<style lang="scss"></style>
