<script setup lang="ts">
import type { ArtistCategory, Artist } from '@amy/shared/types';

definePageMeta({
  workspace: 'artist',
});

type ArtistByCate = {
  category: ArtistCategory;
  list: Artist[];
};

const { isDark } = useColorMode();

const laoding = ref(true);

const artistList = ref<ArtistByCate[]>([]);

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

      <AmyScrollbar v-if="artistList.length > 0 || laoding" view-class="px-4">
        <div class="w-full h-fit">
          <p class="text-muted pb-5">番剧</p>

          <AmyListWrap
            :item-min-width="80"
            :side-width="16"
            :gap-x="36"
            :gap-y="8"
            :list="[]"
            :loading="laoding"
            :loading-col-number="1"
          >
            <template #item="{ item, loading: l }">
              <ASkeletonAvatar
                :paragraph="false"
                :styles="{
                  root: {
                    width: '100%',
                  },
                  content: {
                    width: '100%',
                    height: 'auto',
                    'aspect-ratio': 1,
                    display: 'block',
                  },
                }"
              ></ASkeletonAvatar>
            </template>
          </AmyListWrap>
        </div>
      </AmyScrollbar>

      <div
        v-else
        class="w-full h-full flex items-center justify-center relative bottom-20 flex-col"
      >
        <AmyLogo :color="isDark ? '#343334' : '#f0f0f0'" size="130px" :animation="false" />
        <p :style="{ color: isDark ? '#343334' : '#f0f0f0' }">EMPTY</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
