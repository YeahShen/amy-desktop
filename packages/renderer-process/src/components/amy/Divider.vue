<script setup lang="ts">
/**
 * 分割线组件 — 能力对齐 Nuxt UI Separator（orientation/size/color/type/label），
 * 颜色使用语义色随主题自动切换
 */
const props = withDefaults(
  defineProps<{
    /** 方向：水平（默认）/ 垂直 */
    orientation?: 'horizontal' | 'vertical';
    /** 线宽：xs=1px sm=2px md=3px lg=4px xl=5px */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** 语义色 */
    color?: 'default' | 'muted' | 'primary';
    /** 线型 */
    type?: 'solid' | 'dashed' | 'dotted';
    /** 标签文字（仅水平方向；也可用默认插槽传入自定义内容） */
    label?: string;
    /** 标签位置（仅水平方向） */
    labelPosition?: 'left' | 'center' | 'right';
  }>(),
  {
    orientation: 'horizontal',
    size: 'xs',
    color: 'default',
    type: 'solid',
    label: '',
    labelPosition: 'center',
  },
);

const BORDER_COLOR = {
  default: 'border-default',
  muted: 'border-muted',
  primary: 'border-primary',
} as const;

const BORDER_TYPE = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
} as const;

/** 线宽：与 USeparator 的 size 映射一致 */
const THICKNESS = {
  xs: '1px',
  sm: '2px',
  md: '3px',
  lg: '4px',
  xl: '5px',
} as const;

const colorClass = computed(() => BORDER_COLOR[props.color]);
const typeClass = computed(() => BORDER_TYPE[props.type]);

/** 垂直方向走 border-left，水平方向走 border-top，线宽由内联样式控制 */
const lineStyle = computed(() =>
  props.orientation === 'vertical'
    ? { borderLeftWidth: THICKNESS[props.size] }
    : { borderTopWidth: THICKNESS[props.size] },
);

/** 标签两侧短线：left/right 位置时近端固定宽度，远端自适应填充 */
const labelLines = computed(() => {
  if (props.labelPosition === 'left') return ['w-10 shrink-0', 'flex-1'];
  if (props.labelPosition === 'right') return ['flex-1', 'w-10 shrink-0'];
  return ['flex-1', 'flex-1'];
});
</script>

<template>
  <!-- 垂直分割线：跟随 flex 容器高度拉伸 -->
  <div
    v-if="props.orientation === 'vertical'"
    role="separator"
    aria-orientation="vertical"
    class="divider divider--vertical w-0 self-stretch border-l"
    :class="[colorClass, typeClass]"
    :style="lineStyle"
  />

  <!-- 水平分割线（可带标签） -->
  <div
    v-else
    role="separator"
    aria-orientation="horizontal"
    class="divider divider--horizontal flex w-full items-center gap-3"
  >
    <span
      class="divider__line h-0 border-t"
      :class="[colorClass, typeClass, labelLines[0]]"
      :style="lineStyle"
    />

    <span
      v-if="label || $slots.default"
      class="divider__label flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-default"
    >
      <slot>{{ label }}</slot>
    </span>

    <span
      v-if="label || $slots.default"
      class="divider__line h-0 border-t"
      :class="[colorClass, typeClass, labelLines[1]]"
      :style="lineStyle"
    />
  </div>
</template>

<style lang="scss"></style>
