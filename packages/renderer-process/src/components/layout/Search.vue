<script setup lang="ts">
const active = ref(false);
</script>

<template>
  <div class="search-wrap bg-amber-900 no-drag" :class="{ active }" @click="active = !active">
    <input type="text" />
  </div>
</template>

<style lang="scss">
.search-wrap {
  position: absolute;
  right: 260px;
  top: 50%;
  transform: translate3d(0, -50%, 0);
  transition: all 0.25s;
  width: 210px;

  &.active {
    right: 50%;
    width: 350px;
    transform: translate3d(50%, -50%, 0);
  }
}
</style>
