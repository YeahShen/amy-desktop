<script setup lang="ts">
/**
 * 骨架屏组件 — 功能对齐 Ant Design Skeleton
 * - loading=false 时渲染默认插槽内容（加载完成替换骨架）
 * - avatar / title / paragraph 三段式组合，宽度、行数、形状均可配置
 */
const props = withDefaults(
  defineProps<{
    /** 是否显示骨架屏；false 时渲染插槽内容 */
    loading?: boolean;
    /** 是否开启 shimmer 流动动画 */
    active?: boolean;
    /** 标题/段落是否使用大圆角（胶囊形） */
    round?: boolean;
    /** 头像占位：false 不显示；true 用默认尺寸；或传 { size, shape } */
    avatar?: boolean | { size?: 'small' | 'default' | 'large' | number; shape?: 'circle' | 'square' };
    /** 标题占位：false 不显示；true 用默认（宽 38%）；或传 { width } */
    title?: boolean | { width?: number | string };
    /** 段落占位：false 不显示；true 用默认（3 行，末行 61%）；或传 { rows, width } */
    paragraph?: boolean | { rows?: number; width?: number | string | Array<number | string> };
  }>(),
  {
    loading: true,
    active: false,
    round: false,
    avatar: false,
    title: true,
    paragraph: true,
  },
);

const avatarOption = computed(() => (typeof props.avatar === 'object' ? props.avatar : {}));
const titleOption = computed(() => (typeof props.title === 'object' ? props.title : {}));
const paragraphOption = computed(() => (typeof props.paragraph === 'object' ? props.paragraph : {}));

// —— 头像尺寸/形状 ——
const AVATAR_SIZE: Record<string, number> = { small: 32, default: 40, large: 48 };

const avatarStyle = computed(() => {
  const size = avatarOption.value.size;
  const px = typeof size === 'number' ? size : AVATAR_SIZE[size ?? 'default'];
  return { width: `${px}px`, height: `${px}px` };
});

const avatarShape = computed(() => avatarOption.value.shape ?? 'circle');

// —— 标题/段落 ——
/** number 视为 px，string 原样透传（如 '60%'） */
function toCssWidth(width: number | string | undefined, fallback: string) {
  if (width == null) return fallback;
  return typeof width === 'number' ? `${width}px` : width;
}

const titleWidth = computed(() => toCssWidth(titleOption.value.width, '38%'));

const paragraphRows = computed(() => paragraphOption.value.rows ?? 3);

function defaultRowWidth(index: number) {
  // antd 规则：非末行 100%，末行 61%
  return index === paragraphRows.value - 1 ? '61%' : '100%';
}

/** 段落行宽：width 数组逐行对应；非数组统一应用；未覆盖行用默认规则 */
function rowWidth(index: number): string {
  const width = paragraphOption.value.width;
  if (Array.isArray(width)) return toCssWidth(width[index], defaultRowWidth(index));
  return toCssWidth(width, defaultRowWidth(index));
}
</script>

<template>
  <div v-if="loading" class="skeleton" :class="{ 'is-active': active, 'is-round': round }">
    <span
      v-if="avatar"
      class="skeleton-avatar"
      :class="avatarShape === 'circle' ? 'skeleton-avatar--circle' : 'skeleton-avatar--square'"
      :style="avatarStyle"
    />
    <div class="skeleton-content">
      <span v-if="title" class="skeleton-title" :style="{ width: titleWidth }" />
      <template v-if="paragraph">
        <span
          v-for="row in paragraphRows"
          :key="row"
          class="skeleton-paragraph-row"
          :style="{ width: rowWidth(row - 1) }"
        />
      </template>
    </div>
  </div>
  <slot v-else />
</template>

<style lang="scss">
.skeleton {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;

  .skeleton-avatar {
    flex-shrink: 0;
    background-color: var(--ui-text-dimmed);

    &--circle {
      border-radius: 50%;
    }

    &--square {
      border-radius: 4px;
    }
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 4px;
  }

  .skeleton-title {
    display: block;
    height: 16px;
    border-radius: 4px;
    background-color: var(--ui-text-dimmed);
  }

  .skeleton-paragraph-row {
    display: block;
    height: 14px;
    border-radius: 4px;
    background-color: var(--ui-text-dimmed);
  }

  &.is-round .skeleton-title,
  &.is-round .skeleton-paragraph-row {
    border-radius: 999px;
  }

  // shimmer 流动高光：高光由语义底色混白提亮，明暗主题均呈现"扫光"效果
  &.is-active .skeleton-avatar,
  &.is-active .skeleton-title,
  &.is-active .skeleton-paragraph-row {
    background-image: linear-gradient(
      90deg,
      var(--ui-text-dimmed) 25%,
      color-mix(in srgb, var(--ui-text-dimmed) 55%, white) 37%,
      var(--ui-text-dimmed) 63%
    );
    background-size: 400% 100%;
    animation: skeleton-shimmer 1.4s ease infinite;
  }
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton.is-active .skeleton-avatar,
  .skeleton.is-active .skeleton-title,
  .skeleton.is-active .skeleton-paragraph-row {
    animation: none;
  }
}
</style>
