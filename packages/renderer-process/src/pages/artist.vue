<script setup lang="ts">
definePageMeta({
  workspace: 'artist',
});
</script>

<template>
  <div class="w-full h-main-content">
    <div class="w-full h-full relative pt-15">
      <div
        class="w-full h-fit py-2 flex items-center justify-between px-4 absolute top-0 left-0 bg-(--ui-bg)"
      >
        <h1 class="font-bold text-primary">ARTIST</h1>

        <div class="flex gap-x-3">
          <AButton type="dashed">
            <template #icon>
              <NuxtIcon name="amy:plus-outlined" />
            </template>
          </AButton>

          <AButton type="dashed">
            <template #icon>
              <NuxtIcon name="amy:reload-outlined" />
            </template>
          </AButton>
        </div>
      </div>

      <AmyScrollbar view-class="px-4">
        <p>cds</p>
      </AmyScrollbar>
    </div>
  </div>
</template>

<style lang="scss"></style>
