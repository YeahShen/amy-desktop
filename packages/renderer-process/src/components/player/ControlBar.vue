<script setup lang="ts">
import type { ItemType } from 'antdv-next';
import {
  CaretRightFilled,
  FullscreenExitOutlined,
  FullscreenOutlined,
  MutedOutlined,
  PauseOutlined,
  SettingOutlined,
  SoundOutlined,
  StepBackwardFilled,
  StepForwardFilled,
} from '@antdv-next/icons';

/** 倍速按钮点击时的轮换顺序 */
const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const props = withDefaults(
  defineProps<{
    playing?: boolean;
    /** 当前播放位置（秒） */
    currentTime?: number;
    /** 总时长（秒） */
    duration?: number;
    /** 音量 0 - 1 */
    volume?: number;
    muted?: boolean;
    rate?: number;
    loop?: boolean;
    fullscreen?: boolean;
  }>(),
  {
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    rate: 1,
    loop: false,
    fullscreen: false,
  },
);

const emit = defineEmits<{
  togglePlay: [];
  seek: [time: number];
  prev: [];
  next: [];
  toggleMute: [];
  toggleFullscreen: [];
  'update:rate': [rate: number];
  'update:loop': [loop: boolean];
}>();

// 拖拽期间用本地值显示，避免和 timeupdate 抢进度条
const dragging = ref<number | null>(null);
const displayTime = computed(() => dragging.value ?? props.currentTime);
const sliderMax = computed(() => Math.max(props.duration, 1));

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds || 0));

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function toNumber(value: number | [number, number]) {
  return Array.isArray(value) ? value[0] : value;
}

function onSeekChange(value: number | [number, number]) {
  dragging.value = toNumber(value);
}

function onSeekComplete(value: number | [number, number]) {
  emit('seek', toNumber(value));
  dragging.value = null;
}

function cycleRate() {
  emit('update:rate', RATES[(RATES.indexOf(props.rate) + 1) % RATES.length]);
}

const settingItems = computed<ItemType[]>(() => [
  { key: 'loop', label: props.loop ? '取消循环播放' : '循环播放' },
  { key: 'mute', label: props.muted ? '取消静音' : '静音' },
  {
    key: 'rate',
    label: '播放速度',
    children: RATES.map((rate) => ({ key: `rate-${rate}`, label: `${rate}x` })),
  },
]);

function onMenuClick({ key }: { key: string | number }) {
  const name = String(key);

  if (name === 'loop') {
    emit('update:loop', !props.loop);
  } else if (name === 'mute') {
    emit('toggleMute');
  } else if (name.startsWith('rate-')) {
    emit('update:rate', Number(name.replace('rate-', '')));
  }
}
</script>

<template>
  <div
    class="player-bar flex items-center gap-x-1 w-full h-18 px-14 rounded-full bg-[rgba(35,35,35,0.78)] backdrop-blur-md"
  >
    <!-- 1. 音量 -->
    <a-tooltip :title="props.muted ? '取消静音' : `音量 ${Math.round(props.volume * 100)}%`">
      <button type="button" class="player-btn" aria-label="音量" @click="emit('toggleMute')">
        <MutedOutlined v-if="props.muted" />
        <SoundOutlined v-else />
      </button>
    </a-tooltip>

    <!-- 2. 上一曲 -->
    <a-tooltip title="上一曲">
      <button type="button" class="player-btn" aria-label="上一曲" @click="emit('prev')">
        <StepBackwardFilled />
      </button>
    </a-tooltip>

    <!-- 3. 播放 / 暂停 -->
    <button
      type="button"
      class="player-btn player-btn-primary"
      :aria-label="props.playing ? '暂停' : '播放'"
      @click="emit('togglePlay')"
    >
      <PauseOutlined v-if="props.playing" />
      <CaretRightFilled v-else />
    </button>

    <!-- 4. 下一曲 -->
    <a-tooltip title="下一曲">
      <button type="button" class="player-btn" aria-label="下一曲" @click="emit('next')">
        <StepForwardFilled />
      </button>
    </a-tooltip>

    <!-- 5. 设置 -->
    <a-dropdown
      :menu="{ items: settingItems, onClick: onMenuClick }"
      trigger="click"
      placement="topRight"
    >
      <button type="button" class="player-btn" aria-label="设置">
        <SettingOutlined />
      </button>
    </a-dropdown>

    <!-- 6. 播放速度（圆圈 + S） -->
    <a-tooltip :title="`播放速度 ${props.rate}x`">
      <button type="button" class="player-btn" aria-label="播放速度" @click="cycleRate">
        <span class="player-rate-icon">S</span>
      </button>
    </a-tooltip>

    <!-- 7. 当前时间 -->
    <span class="player-time mx-2">{{ formatTime(displayTime) }}</span>

    <!-- 8. 进度条 -->
    <a-slider
      class="player-slider flex-1"
      :value="displayTime"
      :min="0"
      :max="sliderMax"
      :step="1"
      :tooltip="{ open: false }"
      @change="onSeekChange"
      @change-complete="onSeekComplete"
    />

    <!-- 9. 总时长 -->
    <span class="player-time ml-2">{{ formatTime(props.duration) }}</span>

    <!-- 10. 全屏 -->
    <a-tooltip :title="props.fullscreen ? '退出全屏' : '全屏'">
      <button
        type="button"
        class="player-btn ml-2"
        aria-label="全屏"
        @click="emit('toggleFullscreen')"
      >
        <FullscreenExitOutlined v-if="props.fullscreen" />
        <FullscreenOutlined v-else />
      </button>
    </a-tooltip>
  </div>
</template>

<style lang="scss">
.player-bar {
  /* 进度条配色/尺寸走 antd Slider 的组件 token（zero-runtime 静态主题下全是 CSS 变量）。
     这些 token 由 antd 声明在 `html.light .css-var-v-N.ant-slider`（权重 0,3,1）上，
     普通类选择器盖不住，只能 !important —— 否则会被它自己的声明盖掉。 */
  .ant-slider {
    --ant-slider-control-size: 12px !important;
    --ant-slider-rail-size: 3px !important;
    --ant-slider-rail-bg: rgba(100, 100, 100, 0.5) !important;
    --ant-slider-rail-hover-bg: rgba(120, 120, 120, 0.6) !important;
    --ant-slider-track-bg: #5eead4 !important;
    --ant-slider-track-hover-bg: #5eead4 !important;
    --ant-slider-handle-size: 12px !important;
    --ant-slider-handle-size-hover: 12px !important;
    --ant-slider-handle-active-outline-color: rgba(94, 234, 212, 0.2) !important;

    /* 间距交给父级 flex 布局；上下留出拖拽热区 */
    margin: 0;
    padding: 6px 0;
  }

  .player-btn {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 9999px;
    background: transparent;
    color: #e5e7eb;
    font-size: 18px;
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
      color: #fff;
    }
  }

  /* 主操作：纯白 + 略大 */
  .player-btn-primary {
    color: #fff;
    font-size: 20px;
  }

  /* 倍速按钮：圆形外框 + 字母 S */
  .player-rate-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 1.5px solid currentcolor;
    border-radius: 50%;
    font-size: 11px;
    line-height: 1;
  }

  .player-time {
    flex: none;
    color: #fff;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }

  /* 滑块圆点：纯色薄荷绿、去掉描边环（设计稿是实心圆点而非环） */
  .ant-slider .ant-slider-handle::after {
    background-color: var(--ant-slider-track-bg);
    box-shadow: none;
  }
}
</style>
