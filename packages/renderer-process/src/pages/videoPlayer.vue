<script setup lang="ts">
import type { playerVideoDetail } from '@amy/shared/types';

definePageMeta({
  layout: 'empty',
  colorMode: 'dark',
});

const detail = ref<playerVideoDetail>();
const decryptKey = ref('');
const loading = ref(true);
const loadError = ref('');

const route = useRoute();

async function load(id: string) {
  loading.value = true;
  loadError.value = '';

  // 密钥失败不影响播放，两边并行、各自兜底
  const [info] = await Promise.all([
    $request<playerVideoDetail>('/video/get-video-info', { query: { id } }).catch((error) => {
      loadError.value = (error as { message?: string })?.message || '视频信息加载失败';

      return undefined;
    }),
  ]);

  detail.value = info;
  decryptKey.value = info?.decryptKey || '';
  loading.value = false;
}

onMounted(() => {
  load(route.query?.id as string);

  window.electronAPI.on<string>('change-video', (id) => {
    load(id);
  });
});
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <PlayerNavbar :title="detail?.title" />
    <Player
      :detail="detail"
      :decrypt-key="decryptKey"
      :loading="loading"
      :load-error="loadError"
      @retry="load(route.query?.id as string)"
    />
  </div>
</template>

<style lang="scss"></style>
