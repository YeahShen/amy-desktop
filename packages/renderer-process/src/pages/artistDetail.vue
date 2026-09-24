<script setup lang="ts">
import type { Artist, VideoItem } from '@amy/shared/types';

definePageMeta({
  workspace: 'artist',
  immersiveHeader: true,
});

const artist = ref<Artist>();
const tab = ref('video');

const route = useRoute();
const videoList = ref<VideoItem[]>([]);
const mdaStore = useMdaStore();

const loadProfile = ref(false);
const loadList = ref(false);

watch(tab, (v) => loadMdaList(v));

onMounted(() => {
  load();
});

async function load() {
  await loadArtistProfile();
  await loadMdaList(tab.value);
}

async function loadArtistProfile() {
  try {
    loadProfile.value = true;

    const artistCache = mdaStore.artistMap.get(route.query.id as string);

    if (artistCache) {
      artist.value = artistCache;
    } else {
      const res = await $request<Artist>(`/artist/${route.query.id}`, { method: 'GET' });
      mdaStore.artistMap.set(route.query.id as string, res);

      artist.value = res;
    }
  } finally {
    loadProfile.value = false;
  }
}

async function loadMdaList(type: string) {
  videoList.value = [];
  try {
    if (type === 'video') {
      const videoCache = mdaStore.videoCache.get(route.query.id as string);
      if (videoCache) {
        videoList.value = videoCache;
      } else {
        loadList.value = true;

        const resp = await $request<{
          videoList: VideoItem[];
        }>('/video/get-artiest-videos?id=' + route.query.id);

        videoList.value = resp.videoList;
        mdaStore.videoCache.set(route.query.id as string, videoList.value);
      }
    }
  } finally {
    loadList.value = false;
  }
}

const loadingProfile = computed(() => loadProfile.value && loadList.value);
const loadingList = computed(() => loadProfile.value || loadList.value);

function play(id: string) {
  window.electronAPI.send('play-video', id);
}
</script>

<template>
  <LayoutPage class="bg-[#f6f7f8] dark:bg-[#0d0d0e]">
    <div class="profile-wrap h-(--navbar-height) w-full sticky top-0 bg-(--ui-bg)"></div>

    <ArtistProfile :artist="artist" :loading="loadingProfile" />

    <div
      class="w-full h-10 bg-(--ui-bg) flex items-end sticky top-(--navbar-height) border-b border-(--ant-color-border-secondary) z-999"
    >
      <ArtistTabBar v-model="tab" :loading="loadingProfile" />
    </div>

    <div class="w-full rs-wrap py-6 h-fit">
      <AmyListWrap
        :item-min-width="220"
        :side-width="32"
        :gap-x="36"
        :gap-y="26"
        :list="videoList"
        :loading-row-number="5"
        :loading="loadingList"
      >
        <template #item="{ item, loading: l }">
          <VideoItem :loading="l" :item :artist="artist" show-artist @play="play" />
        </template>
      </AmyListWrap>
    </div>
  </LayoutPage>
</template>

<style lang="scss">
.rs-wrap {
  min-height: calc(100vh - 584px);
}
</style>
