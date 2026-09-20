<script setup lang="ts">
import '@videojs/html/video/player';
import '@videojs/html/video/skin';
import '@videojs/html/media/hlsjs-video';

import { selectControls, selectVolume } from '@videojs/html';
import type { VideoPlayerElement } from '@videojs/html/video';

import { getDecryptedFragmentLoader } from './decrypted-ts-loader';
import type { playerVideoDetail } from '@amy/shared/types';

type VolumePrefs = { volume: number; muted: boolean };
const VOLUME_STORAGE_KEY = 'amy:player:volume';

const props = defineProps<{
  detail?: playerVideoDetail;
  decryptKey: string;
  loading: boolean;
  loadError: string;
}>();

/** 拉取详情是父级的活，重试也交回去 */
const emit = defineEmits<{ retry: [] }>();

const playUrl = computed(() => props.detail?.playUrl);
const title = computed(() => props.detail?.title);
const autoplay = computed(() => false);
const playerRef = useTemplateRef<VideoPlayerElement>('player');

const unsubscribers: Array<() => void> = [];

function clearSubscribers() {
  unsubscribers.forEach((off) => off());
  unsubscribers.length = 0;
}

function readSavedVolume(): VolumePrefs | null {
  try {
    return JSON.parse(localStorage.getItem(VOLUME_STORAGE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function saveVolume(prefs: VolumePrefs) {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // 存储不可用（隐私模式等），跳过持久化
  }
}

/** 音量/静音跟着 store 变化写回 localStorage，并在 store 挂上 media 后恢复一次 */
function bindVolumePersistence(player: VideoPlayerElement) {
  const { store } = player;
  const saved = readSavedVolume();

  if (saved) {
    const restore = () => {
      // store 还没 attach 到 media 时调动作会抛，等到 attach 再恢复
      if (!store.target) return false;

      const volume = selectVolume(store.state);

      volume?.setVolume(saved.volume);
      // setVolume 到 0 以上会自动取消静音，静音偏好要补一次；音量本身为 0 时已经是静音态
      if (volume && saved.muted && saved.volume > 0) volume.toggleMuted();

      return true;
    };

    if (!restore()) {
      const off = store.subscribe(() => {
        if (restore()) off();
      });

      unsubscribers.push(off);
    }
  }

  let last: VolumePrefs = saved ?? { volume: 1, muted: false };

  unsubscribers.push(
    store.subscribe(() => {
      const volume = selectVolume(store.state);

      if (!volume || (volume.volume === last.volume && volume.muted === last.muted)) return;

      last = { volume: volume.volume, muted: volume.muted };
      saveVolume(last);
    }),
  );
}

/** 标题跟随控制栏显隐：控制栏的可见性由皮肤按用户活动 + 播放状态算，订阅过来直接用 */
function bindControlsVisibility(player: VideoPlayerElement) {
  const { store } = player;

  const sync = () => {
    const controls = selectControls(store.state);

    if (controls) controlsVisible.value = controls.controlsVisible;
  };

  sync();
  unsubscribers.push(store.subscribe(sync));
}

/** 后端转码产物若是 HLS 就走 hlsjs-video —— Chromium 的原生 video 放不了 m3u8，
    而且 TS 分片只有 hls.js 这条路（SPF 的 hls-video 不吃 MPEG-TS） */
const isHls = computed(() => /\.m3u8(\?|$)/i.test(playUrl.value || ''));

/**
 * hls.js 的结构化 source：分片要解密时挂上自定义 fLoader。
 * 类引用按密钥缓存（见 decrypted-ts-loader），否则 hls.js 会当成配置变了而重建引擎。
 */
const hlsSource = computed(() => {
  const fLoader = props.decryptKey ? getDecryptedFragmentLoader(props.decryptKey) : undefined;

  return {
    src: playUrl.value ?? '',
    ...(fLoader ? { engine: { hlsJs: { fLoader } } } : {}),
  };
});

// 播放器只在拿到播放地址后才渲染，所以监听 ref 而不是在 onMounted 里一次性绑定
watch(playerRef, (player) => {
  clearSubscribers();

  if (!player) return;

  bindVolumePersistence(player);
  bindControlsVisibility(player);
});

/** 控制栏是否可见（皮肤按用户活动/播放状态算好），标题跟着它一起显隐 */
const controlsVisible = ref(true);

onUnmounted(clearSubscribers);
</script>

<template>
  <div class="player-stage relative w-full h-full overflow-hidden bg-[#17181a]">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <a-spin size="large" />
    </div>

    <div
      v-else-if="loadError"
      class="absolute inset-0 flex flex-col items-center justify-center gap-y-4 px-10 text-center"
    >
      <p class="text-white/60">{{ loadError }}</p>
      <AButton @click="emit('retry')">重试</AButton>
    </div>

    <template v-else-if="playUrl">
      <video-player ref="player" :content-title="title || null">
        <video-skin>
          <!-- 播放器皮肤已内置控制栏、快捷键、手势、缓冲/错误提示与海报 -->
          <hlsjs-video
            v-if="isHls"
            :source.prop="hlsSource"
            playsinline
            :autoplay="autoplay"
            preload="metadata"
          ></hlsjs-video>
          <video v-else :src="playUrl" playsinline :autoplay="autoplay" preload="metadata"></video>
        </video-skin>
      </video-player>

      <p v-if="title" class="player-title" :class="{ 'is-hidden': !controlsVisible }">
        {{ title }}
      </p>
    </template>

    <div v-else class="absolute inset-0 flex items-center justify-center text-white/40">
      缺少播放参数
    </div>
  </div>
</template>

<style lang="scss">
.player-stage {
  /* 皮肤只声明了 host 的 width + display:grid，高度要由外部给 */
  video-skin {
    width: 100%;
    height: 100%;

    /* zero-runtime 静态主题下的皮肤公开变量：沿用应用的薄荷绿与正文系统字体 */
    --media-accent-color: #5eead4;
    --media-font-family: PingFangSC;
    --media-border-radius: 0;
    --media-object-fit: contain;
    --media-object-position: center;

    /* 皮肤的尺寸写在 shadow 里的 ::slotted(video) 上，优先级输给 Tailwind preflight 的
       `video { height: auto }`，结果 video 元素只有固有高度、贴着容器顶部（实测 1064×150）。
       文档级样式再撑一次，画面才会在容器里居中 */
    video {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: var(--media-object-fit, contain);
      object-position: var(--media-object-position, center);
    }

    /* 自定义媒体元素自身不产生布局盒，撑满容器后由内部 video 成像 */
    hls-video,
    hlsjs-video {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  .player-title {
    pointer-events: none;
    position: absolute;
    top: 20px;
    left: 24px;
    color: #fff;
    font-size: 15px;
    /* 时长与皮肤控制栏的淡入淡出一致 */
    transition: opacity 0.25s;
  }

  .player-title.is-hidden {
    opacity: 0;
  }
}
</style>
