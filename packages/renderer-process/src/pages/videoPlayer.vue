<script setup lang="ts">
import { message } from 'antdv-next';

definePageMeta({
  layout: 'empty',
  colorMode: 'dark',
});

/** 设计稿（player-prompt.md）的演示数值：没有视频源时按这套渲染，方便逐项对照还原 */
const DEMO = { title: 'The Island', currentTime: 31, duration: 204 };

const SEEK_STEP = 10;
const VOLUME_STEP = 0.05;

const route = useRoute();
const config = useRuntimeConfig();

const stageRef = useTemplateRef<HTMLElement>('stage');
const videoRef = useTemplateRef<HTMLVideoElement>('video');

const playing = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const muted = ref(false);
const rate = ref(1);
const loop = ref(false);
const fullscreen = ref(false);

/**
 * 播放源：?src= 直接给可加载的 URL；
 * ?filePath= 走本地文件路由 —— dev/mock 由 Nuxt Nitro 提供，打包态由主进程 Koa 提供
 */
const src = computed(() => {
  const { src, filePath } = route.query;

  if (src) return String(src);

  if (filePath) {
    const path = encodeURIComponent(String(filePath));

    return config.public.model === 'production'
      ? `/local?path=${path}`
      : `/local-file?filePath=${path}`;
  }

  return '';
});

const isDemo = computed(() => !src.value);
const shownCurrentTime = computed(() => (isDemo.value ? DEMO.currentTime : currentTime.value));
const shownDuration = computed(() => (isDemo.value ? DEMO.duration : duration.value));
const title = computed(() => String(route.query.title || (isDemo.value ? DEMO.title : '')));

/** 换了源之后把播放参数重新贴回 video 元素上 */
function applyPlayerState() {
  const video = videoRef.value;

  if (!video) return;

  video.volume = volume.value;
  video.muted = muted.value;
  video.playbackRate = rate.value;
  video.loop = loop.value;
}

async function togglePlay() {
  const video = videoRef.value;

  if (!video || isDemo.value) return;

  if (video.paused) {
    try {
      await video.play();
    } catch {
      message.error('该视频无法播放');
    }
  } else {
    video.pause();
  }
}

function seek(time: number) {
  const video = videoRef.value;

  if (!video || isDemo.value) return;

  video.currentTime = Math.min(Math.max(time, 0), video.duration || 0);
  currentTime.value = video.currentTime; // 立刻回显，避免松手瞬间滑块回跳
}

/** 单视频播放下：上一曲 = 从头重播（后续接播放列表时换成真正的上一集） */
function prev() {
  seek(0);
}

/** 单视频播放下：下一曲 = 前进 10 秒 */
function next() {
  seek(currentTime.value + SEEK_STEP);
}

function toggleMute() {
  const video = videoRef.value;

  if (video) {
    video.muted = !video.muted; // volumechange 会同步回 muted
  } else {
    muted.value = !muted.value;
  }
}

function changeVolume(delta: number) {
  const next = Math.min(Math.max(volume.value + delta, 0), 1);
  const video = videoRef.value;

  if (video) {
    video.volume = next;
    if (next > 0 && video.muted) video.muted = false;
  } else {
    volume.value = next;
    if (next > 0 && muted.value) muted.value = false;
  }
}

function setRate(value: number) {
  rate.value = value;

  if (videoRef.value) videoRef.value.playbackRate = value;
}

async function toggleFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await stageRef.value?.requestFullscreen();
  }
}

function onVolumeChange() {
  const video = videoRef.value;

  if (!video) return;

  volume.value = video.volume;
  muted.value = video.muted;
}

function onLoadedMetadata() {
  const video = videoRef.value;

  if (!video) return;

  duration.value = Number.isFinite(video.duration) ? video.duration : 0;
  currentTime.value = 0;
  playing.value = false;
  applyPlayerState();
}

/** 键盘快捷键：空格/K 播放暂停、左右 10 秒、上下音量、F 全屏、M 静音 */
function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;

  if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

  switch (event.key) {
    case ' ':
    case 'k':
      event.preventDefault();
      togglePlay();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      seek(shownCurrentTime.value - SEEK_STEP);
      break;
    case 'ArrowRight':
      event.preventDefault();
      seek(shownCurrentTime.value + SEEK_STEP);
      break;
    case 'ArrowUp':
      event.preventDefault();
      changeVolume(VOLUME_STEP);
      break;
    case 'ArrowDown':
      event.preventDefault();
      changeVolume(-VOLUME_STEP);
      break;
    case 'f':
      toggleFullscreen();
      break;
    case 'm':
      toggleMute();
      break;
  }
}

function onFullscreenChange() {
  fullscreen.value = !!document.fullscreenElement;
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  document.addEventListener('fullscreenchange', onFullscreenChange);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<template>
  <div ref="stage" class="relative w-full h-full overflow-hidden bg-[#17181a]">
    <video
      ref="video"
      :src="src || undefined"
      preload="metadata"
      class="w-full h-full object-contain"
      @click="togglePlay"
      @play="playing = true"
      @pause="playing = false"
      @ended="playing = false"
      @timeupdate="currentTime = videoRef?.currentTime || 0"
      @volumechange="onVolumeChange"
      @loadedmetadata="onLoadedMetadata"
    ></video>

    <div v-if="title" class="absolute left-6 top-5 text-[15px] text-white">{{ title }}</div>

    <div class="absolute inset-x-4 bottom-4">
      <PlayerControlBar
        :playing="playing"
        :current-time="shownCurrentTime"
        :duration="shownDuration"
        :volume="volume"
        :muted="muted"
        :rate="rate"
        :loop="loop"
        :fullscreen="fullscreen"
        @toggle-play="togglePlay"
        @seek="seek"
        @prev="prev"
        @next="next"
        @toggle-mute="toggleMute"
        @toggle-fullscreen="toggleFullscreen"
        @update:rate="setRate"
        @update:loop="loop = $event"
      />
    </div>
  </div>
</template>
