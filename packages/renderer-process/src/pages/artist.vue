<script setup lang="ts">
import type { Artist } from '@amy/shared/types';

definePageMeta({
  workspace: 'artist',
});

type ArtistByCate = {
  id: number;
  title: string;
  list: Artist[];
};

const { isDark } = useColorMode();

const laoding = ref(true);

const artistList = ref<ArtistByCate[]>([]);

const renderList = computed<ArtistByCate[]>(() => {
  if (!laoding.value) return artistList.value;
  return new Array(10).fill(0).map((_i, idx) => ({
    id: idx,
    title: '',
    list: [],
  }));
});

async function createArtist() {
  await openDialog('createArtist', { width: 600, height: 500 }, true);
  artistList.value = await $request<ArtistByCate[]>('/artist/list');
}

async function select(artist: Artist) {
  navigateTo('artistDetail?id=' + artist.id);
}

onMounted(async () => {
  laoding.value = true;
  artistList.value = await $request<ArtistByCate[]>('/artist/list');
  laoding.value = false;
});
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
        v-if="renderList.length > 0 || laoding"
        view-class="px-4 flex flex-col gap-y-10"
        :disabled="laoding"
      >
        <div v-for="(i, idx) in renderList" :key="i.id" class="w-full h-fit">
          <div class="pb-8">
            <a-skeleton
              :loading="laoding"
              :paragraph="false"
              active
              :styles="{
                title: {
                  width: '120px',
                },
              }"
            >
              <p class="text-muted">{{ i.title }}</p>
            </a-skeleton>
          </div>

          <AmyListWrap
            :item-min-width="80"
            :side-width="16"
            :gap-x="36"
            :gap-y="20"
            :list="i.list"
            :loading="laoding"
            :loading-row-number="idx + 1"
            item-classes="cursor-pointer hover:text-primary"
            @select="select"
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
                <AAvatar
                  shape="circle"
                  :src="item.avatar"
                  :style="{ width: '100%', height: 'auto', 'aspect-ratio': 1 }"
                />
              </a-skeleton>

              <div class="mt-3 w-full">
                <a-skeleton
                  active
                  :loading="l"
                  :paragraph="false"
                  :styles="{
                    title: {
                      width: '100%',
                    },
                  }"
                >
                  <p class="w-full text-center">{{ item.name }}</p>
                </a-skeleton>
              </div>
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
