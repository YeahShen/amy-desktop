<script setup lang="ts">
import type { Artist } from '@amy/shared/types';

definePageMeta({
  workspace: 'artist',
  keepalive: true,
});

type ArtistByCate = {
  id: number;
  title: string;
  list: Artist[];
};

const loading = ref(true);
const artistList = ref<ArtistByCate[]>([]);
const { containerProp } = useListContainer('artistlistPage');
const { isDark } = useColorMode();

const renderList = computed<ArtistByCate[]>(() => {
  if (!loading.value) return artistList.value;
  return new Array(3).fill(0).map((_i, idx) => ({
    id: idx,
    title: '',
    list: [],
  }));
});

// async function createArtist() {
//   await openDialog('createArtist', { width: 600, height: 500 }, true);
//   artistList.value = await $request<ArtistByCate[]>('/artist/list');
// }

async function select(artist: Artist) {
  navigateTo('artistDetail?id=' + artist.id);
}

onMounted(async () => {
  loading.value = true;
  artistList.value = await $request<ArtistByCate[]>('/artist/list');
  loading.value = false;
});
</script>

<template>
  <LayoutPage
    :classes="{
      content: 'px-4',
    }"
    :disabled-scroll="loading"
  >
    <template #navbar-content> </template>

    <template v-if="renderList.length > 0 || loading">
      <div v-for="(i, idx) in renderList" :key="i.title" class="w-full h-fit relative mb-6">
        <div
          class="sticky top-(--navbar-height) w-full bg-container z-99 flex items-center h-10 mb-4"
        >
          <a-skeleton
            :loading
            :paragraph="false"
            active
            :styles="{
              title: {
                width: '180px',
                height: '22px',
              },
            }"
          >
            <p class="text-muted">{{ i.title }}</p>
          </a-skeleton>
        </div>

        <AmyListContainer
          :side-width="containerProp.sideWidth"
          :gap-x="containerProp.gapX"
          :column-count="containerProp.columnCount"
          :gap-y="36"
          :list="i.list"
          :loading="loading"
          :loading-row-number="idx + 1"
          item-classes="cursor-pointer hover:text-primary"
          @select="select"
        >
          <template #item="{ item }">
            <a-skeleton
              :loading
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

            <div class="mt-5 w-full">
              <a-skeleton
                active
                :loading
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
        </AmyListContainer>
      </div>
    </template>

    <div v-else class="w-full h-full flex items-center justify-center relative bottom-20 flex-col">
      <AmyLogo :color="isDark ? '#343334' : '#f0f0f0'" size="130px" :animation="false" />
      <p :style="{ color: isDark ? '#343334' : '#f0f0f0' }">EMPTY</p>
    </div>
  </LayoutPage>
</template>

<style lang="scss"></style>
