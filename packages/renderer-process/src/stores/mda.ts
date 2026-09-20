import type { Artist, VideoItem } from '@amy/shared/types';

export const useMdaStore = defineStore('mdaStore', () => {
  const artistMap = ref<Map<string, Artist>>(new Map<string, Artist>());
  const videoCache = ref<Map<string, VideoItem[]>>(new Map<string, VideoItem[]>());

  return {
    artistMap,
    videoCache,
  };
});
