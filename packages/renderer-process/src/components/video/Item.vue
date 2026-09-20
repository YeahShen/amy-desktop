<script setup lang="ts">
import type { Artist, VideoItem } from '@amy/shared/types';
import dayjs from 'dayjs';

const props = defineProps<{
  item: VideoItem;
  loading: boolean;
  artist?: Artist;
  showArtist: boolean;
}>();

const emits = defineEmits<{
  play: [id: string];
}>();

/**
 * 将视频时长秒数转换为 00:00 或 00:00:00 格式的字符串。
 * @param seconds 视频时长，单位为秒。可以是整数或浮点数。
 * @returns 格式化后的时间字符串。如果秒数小于 1 小时，返回 MM:SS；否则返回 HH:MM:SS。
 * @throws 如果传入的不是有效数字或为负数，则抛出错误。
 */
function formatVideoDuration(seconds: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    throw new Error('Invalid input: seconds must be a non-negative number.');
  }

  const totalSeconds = Math.round(seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (num: number): string => num.toString().padStart(2, '0');

  if (hours > 0) {
    // 小时不补零，分钟和秒补零
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  } else {
    return `${pad(minutes)}:${pad(secs)}`;
  }
}

const duration = computed(() => {
  return formatVideoDuration(props.item.duration);
});

const uploadDate = computed(() => {
  const d = dayjs(props.item.createdAt);
  const str = d.format('YYYY-MM-DD');

  return str.replace('', '');
});

function play() {
  if (props.loading) return;
  emits('play', props.item.id);
}
</script>

<template>
  <div class="w-full h-fit video-item-wrap">
    <a-skeleton
      :title="{}"
      :loading="loading"
      :active="true"
      :styles="{
        title: {
          width: '100%',
          height: 'auto',
          aspectRatio: '16 / 9',
        },
        paragraph: {
          display: 'flex',
          flexDirection: 'column',
          rowGap: '10px',
          marginTop: '10px',
        },
      }"
    >
      <div class="w-full h-fit poster-wrap aspect-video overflow-hidden relative" @click="play">
        <a-image
          width="100%"
          class="aspect-video rounded-lg cursor-pointer"
          alt="basic"
          :preview="false"
          :src="item.posterUrl"
        />

        <div
          class="w-full absolute bottom-0 h-10 bg-gradient-to-b from-black/0 to-black/80 flex justify-between px-2 font-medium text-white"
        >
          <div class="flex items-center" @click="play">
            <span>{{ item.typeTitle }}</span>
          </div>
          <div class="flex items-center">{{ duration }}</div>
        </div>
      </div>

      <div
        class="flex cursor-pointer items-start text-default hover:text-primary pr-2 title pt-2 h-11.5 justify-between"
      >
        <p class="line-clamp-2 leading-normal text-[15px] font-medium">
          {{ item.title }}
        </p>

        <div class="w-3 shrink-0">
          <NuxtIcon class="more-icon" name="amy:more-outlined" size="22" />
        </div>
      </div>

      <div
        class="sub-info flex items-center justify-between text-xs text-muted mt-2 cursor-pointer pr-3"
      >
        <div class="flex items-center gap-x-1">
          <span v-if="showArtist" class="hover:text-primary-active">{{ artist?.name }}</span>
          <NuxtIcon v-if="showArtist" name="amy:dot-bold" />
          <span>{{ uploadDate }}</span>
        </div>

        <div>{{ item.serialNumber }}</div>
      </div>
    </a-skeleton>
  </div>
</template>

<style lang="scss">
.video-item-wrap {
  .ant-skeleton-section {
    .ant-skeleton-paragraph {
      li {
        margin: 0 !important;
      }
    }
  }

  .poster-wrap {
    transition: all 0.25s;

    &:hover {
      transform: scale(1.075);
    }
  }
}

.title {
  transition: all 0.25s;

  .more-icon {
    display: none;
  }

  &:hover {
    .more-icon {
      display: block;
    }
  }
}
</style>
