<script setup lang="ts">
definePageMeta({
  workspace: 'artist',
});

const { isDark } = useColorMode();

async function createArtist() {
  await openDialog('createArtist', { width: 600, height: 500 }, true);
}
</script>

<template>
  <div class="w-full h-main-content">
    <div class="w-full h-full relative pt-15">
      <div
        class="w-full h-fit flex items-center justify-between px-4 absolute top-0 left-0 bg-(--ui-bg) z-999"
      >
        <h1 class="font-bold text-primary text-lg">艺术家</h1>

        <div class="flex gap-x-3">
          <AButton type="dashed" @click="createArtist">
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

      <!-- <AmyScrollbar view-class="px-4">
        <p>cds</p>
      </AmyScrollbar> -->

      <div class="w-full h-full flex items-center justify-center relative bottom-20 flex-col">
        <AmyLogo :color="isDark ? '#16191d' : '#f0f0f0'" size="130px" :animation="false" />
        <p :style="{ color: isDark ? '#16191d' : '#f0f0f0' }">EMPTY</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
