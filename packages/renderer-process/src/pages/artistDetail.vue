<script setup lang="ts">
import type { Artist } from '@amy/shared/types';

definePageMeta({
  workspace: 'artist',
  immersiveHeader: true,
});

const artist = ref<Artist>();

const route = useRoute();

onMounted(() => {
  $request<Artist>(`/artist/${route.query.id}`, { method: 'GET' }).then((res) => {
    artist.value = res;
  });
});

console.log(route);
</script>

<template>
  <LayoutPage class="bg-[#f6f7f8] dark:bg-[#0d0d0e]">
    <div class="profile-wrap h-(--navbar-height) w-full sticky top-0 bg-(--ui-bg)"></div>

    <ArtistProfile :artist="artist" loading />

    <div class="w-full h-10 bg-(--ui-bg) flex items-end sticky top-(--navbar-height)">
      <ArtistTabBar />
    </div>
  </LayoutPage>
</template>

<style lang="scss"></style>
