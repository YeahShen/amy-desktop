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

      <AmyScrollbar
        v-if="artistList.length > 0 || laoding"
        view-class="px-4 flex flex-col gap-y-10"
      >
        <div v-for="i in artistList" :key="i.category.id" class="w-full h-fit">
          <div class="pb-8">
            <a-skeleton
              :loading="laoding"
              :paragraph="false"
              active
              :styles="{
                title: {
                  width: '66px',
                },
              }"
            >
              <p class="text-muted">{{ i.category.title }}</p>
            </a-skeleton>
          </div>

          <AmyListWrap
            :item-min-width="70"
            :side-width="16"
            :gap-x="36"
            :gap-y="8"
            :list="i.list"
            :loading="laoding"
            :loading-row-number="1"
          >
            <template #item="{ item, loading: l }">
              <a-skeleton
                :loading="l"
                :paragraph="false"
                :avatar="{ shape: 'circle' }"
                active
                :styles="{
                  avatar: {
                    width: '100%',
                    height: 'auto',
                    'aspect-ratio': 1,
                    display: 'block',
                  },
                  header: {
                    padding: 0,
                  },
                }"
                :title="false"
              >
                <AAvatar class="w-full" shape="circle" :src="item.avatar" />
              </a-skeleton>

              <a-skeleton
                class="mt-3"
                active
                :loading="l"
                :paragraph="false"
                :styles="{
                  title: {
                    width: '100%',
                  },
                }"
              >
                <p>{{ item.name }}</p>
              </a-skeleton>
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
