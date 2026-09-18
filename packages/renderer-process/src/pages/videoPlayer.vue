<script setup lang="ts">
definePageMeta({
  layout: 'empty',
  colorMode: 'dark',
});

/** GET /video/get-video-info?id= 的返回结构 */
type VideoDetail = {
  id: string;
  title: string;
  description?: string;
  /** 海报图，缺省时不显示 */
  poster?: string;
  /** 播放地址：mp4 直链或 HLS 的 m3u8 */
  url: string;
  duration?: number;
};

const detail = ref<VideoDetail>();
const loading = ref(true);
const loadError = ref('');

async function load() {
  loading.value = true;
  loadError.value = '';

  try {
    detail.value = await $request<VideoDetail>('/video/get-video-info', { query: { id: 'xxx3' } });
  } catch (error) {
    loadError.value = (error as { message?: string })?.message || '视频信息加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="w-full h-full">
    <Player :detail="detail" :loading :load-error />
  </div>
</template>

<style lang="scss"></style>
