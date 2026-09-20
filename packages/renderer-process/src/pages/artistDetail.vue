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

const loadProfile = ref(false);
const loadList = ref(false);

onMounted(() => {
  load();
});

async function load() {
  try {
    loadProfile.value = true;
    const res = await $request<Artist>(`/artist/${route.query.id}`, { method: 'GET' });
    artist.value = res;

    loadList.value = true;
    const resp = await $request<{
      videoId: string;
      videoList: VideoItem[];
    }>('/video/get-artiest-videos?id=' + route.query.id);

    videoList.value = resp.videoList;
  } catch {
    loadProfile.value = false;
  }
  loadProfile.value = false;
  loadList.value = false;
}

const loadingProfile = computed(() => loadProfile.value && loadList.value);
const loadingList = computed(() => loadProfile.value || loadList.value);

console.log(route);
</script>

<template>
  <LayoutPage class="bg-[#f6f7f8] dark:bg-[#0d0d0e]">
    <div class="profile-wrap h-(--navbar-height) w-full sticky top-0 bg-(--ui-bg)"></div>

    <ArtistProfile :artist="artist" :loading="loadingProfile" />

    <div
      class="w-full h-10 bg-(--ui-bg) flex items-end sticky top-(--navbar-height) border-b border-(--ant-color-border-secondary)"
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
          <VideoItem :loading="l" :item :artist="artist" show-artist />
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
