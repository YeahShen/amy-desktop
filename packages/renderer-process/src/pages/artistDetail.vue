<script setup lang="ts">
import type { Artist } from '@amy/shared/types';
import { UserOutlined } from '@antdv-next/icons';

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

    <ArtistProfile :artist="artist" />

    <div class="w-full h-15 bg-(--ui-bg) border-b border-default/50"></div>
  </LayoutPage>
</template>

<style lang="scss">
.poster {
  isolation: isolate;
}
.poster::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: var(--img-url);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: var(--img-filter);
  transform: scale(1.02); /* 可选，防止模糊边缘露底 */
  transition:
    filter 0.3s ease,
    transform 0.3s ease;
}

.poster::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--img-overlay);
  backdrop-filter: var(--img-backdrop);
  -webkit-backdrop-filter: var(--img-backdrop);
  pointer-events: none;
  transition:
    background 0.3s ease,
    backdrop-filter 0.3s ease;
}
</style>
