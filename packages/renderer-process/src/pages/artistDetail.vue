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

const appStore = useAppStore();

const wle = computed(() => appStore.lwem.get('artistDetailPage'));

const loadProfile = ref(false);
const loadList = ref(false);
const { containerProp } = useListContainer('artistDetailPage');

// watch(tab, (v) => {
//   // jump(v);
// });

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
  <LayoutPage
    immersive-header
    :styles="{}"
    :classes="{
      navbar: 'profile-placeholder',
    }"
  >
    <!-- <div class="profile-placeholder w-full sticky top-0 bg-(--ui-bg)/50 glass-bg z-1"></div> -->

    <ArtistProfile :artist="artist" :loading="loadingProfile" />

    <div
      class="w-full h-10 flex items-end sticky top-(--navbar-height) border-b border-(--ant-color-border-secondary) z-999"
    >
      <ArtistTabBar v-model="tab" :loading="loadingProfile" />
    </div>

    <div class="w-full rs-wrap py-6 h-fit bg-[#f6f7f8] dark:bg-[#0d0d0e]">
      <AmyListContainer
        :side-width="containerProp.sideWidth"
        :gap-x="containerProp.gapX"
        :gap-y="40"
        :column-count="containerProp.columnCount"
        :list="videoList"
        :loading-row-number="5"
        :loading="loadingList"
      >
        <template #item="{ item, loading: l }">
          <VideoItem :loading="l" :item :artist="artist" show-artist @play="play" />
        </template>
      </AmyListContainer>
    </div>
  </LayoutPage>
</template>

<style lang="scss">
.rs-wrap {
  min-height: calc(100vh - 323px);
}

.profile-placeholder {
  height: calc(#{var(--navbar-height)} + 38px);
}
</style>
