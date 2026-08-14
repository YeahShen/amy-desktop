<script setup lang="ts">
const searchWrapRef = useTemplateRef('searchWrapRef');

const has = ref(false);
const focus = ref(false);

onClickOutside(searchWrapRef, () => (focus.value = false));

const active = computed(() => has.value || focus.value);
</script>

<template>
  <div
    ref="searchWrapRef"
    class="search-wrap no-drag flex items-center h-8 rounded"
    :class="[{ active, 'dark:bg-[#2c313a]/40 bg-[#f4f6f9]': !active }]"
    @click="focus = true"
  >
    <input type="text" placeholder="输入关键词..." />
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
  box-sizing: content-box;
  border: 1px solid transparent;

  input {
    height: 100%;
    flex: 1;
    outline: none;
    font-size: 14px;
    padding: 0 8px;

    &::placeholder {
      font-size: 12px;
    }
  }

  &.active {
    right: 50%;
    width: 350px;
    transform: translate3d(50%, -50%, 0);
    border: 1px solid var(--color-primary-400);
  }
}
</style>
