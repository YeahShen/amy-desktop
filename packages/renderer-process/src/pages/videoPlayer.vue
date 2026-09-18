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

/**
 * 解密密钥走单独的接口。
 *
 * ⚠ 路径 / 字段名按后端实际改（这里按现有 /video/* 命名风格填的）。
 * 取不到就当分片没加密播，不至于整页打不开。
 */
async function fetchDecryptKey(id: string) {
  try {
    const res = await $request<{ key?: string }>('/video/get-decrypt-key', { query: { id } });

    return res?.key ?? '';
  } catch (error) {
    console.warn('[player] 解密密钥获取失败，按未加密处理', error);

    return '';
  }
}

async function load() {
  loading.value = true;
  loadError.value = '';

  const id = 'xxx3';

  // 密钥失败不影响播放，两边并行、各自兜底
  const [info, key] = await Promise.all([
    $request<playerVideoDetail>('/video/get-video-info', { query: { id } }).catch((error) => {
      loadError.value = (error as { message?: string })?.message || '视频信息加载失败';

      return undefined;
    }),
    fetchDecryptKey(id),
  ]);

  detail.value = info;
  decryptKey.value = key;
  loading.value = false;
}

onMounted(load);
</script>

<template>
  <div class="w-full h-full">
    <Player
      :detail="detail"
      :decrypt-key="decryptKey"
      :loading="loading"
      :load-error="loadError"
      @retry="load"
    />
  </div>
</template>

<style lang="scss"></style>
