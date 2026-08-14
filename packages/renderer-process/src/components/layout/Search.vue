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
    class="search-wrap no-drag flex items-center h-8 rounded justify-between"
    :class="[
      {
        active,
        'dark:bg-[#232527] hover:dark:bg-[#2f3134] bg-[#f1f2f3] hover:bg-[#e3e5e7]': !active,
      },
    ]"
    @click="focus = true"
  >
    <input type="text" placeholder="输入关键词..." />

    <div class="w-8 h-8 shrink-0 flex items-center justify-center cursor-pointer">
      <NuxtIcon name="i-lucide-search" />
    </div>
  </div>
</template>

<style lang="scss">
.search-wrap {
  position: absolute;
  right: 260px;
  top: 50%;
  transform: translate3d(0, -50%, 0);
  transition: all 0.25s;
  width: 240px;
  box-sizing: content-box;
  border: 1px solid transparent;

  input {
    flex: 1;
    outline: none;
    font-size: 14px;
    padding: 0 0 0 8px;

    &::placeholder {
      font-size: 13px;
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
