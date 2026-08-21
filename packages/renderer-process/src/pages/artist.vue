<script setup lang="ts">
definePageMeta({
  workspace: 'artist',
});
</script>

<template>
  <div class="w-full h-main-content">
    <LayoutTitleWrap>
      <h1 class="text-primary text-xl">ARTIST</h1>
    </LayoutTitleWrap>

    <div class="w-full min-h-full relative pt-15">
      <div
        class="w-full h-15 flex items-center justify-end px-4 absolute top-0 left-0 bg-(--ui-bg)"
      >
        <AButton type="primary" wrap gap="small">新建</AButton>
      </div>

      <div>彻底删除的的撒</div>
    </div>
  </div>
</template>

<style lang="scss"></style>
