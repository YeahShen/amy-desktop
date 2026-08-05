<script setup lang="ts" generic="T extends { [key: string]: any }">
import type { InputProps } from '#ui/types';
import { useElementBounding } from '@vueuse/core';

const props = withDefaults(
  defineProps<
    {
      items: T[];
      menuMaxHeight?: number;
      keyValue?: string;
      labelValue?: string;
    } & InputProps
  >(),
  {
    size: 'xl',
    keyValue: 'id',
    labelValue: 'label',
    menuMaxHeight: 100,
  },
);

const slots = defineSlots<{
  default: (props: { ui: object }) => any;
  leading: (props: { ui: object }) => any;
  trailing: (props: { ui: object }) => any;
  item: (props: { item: T }) => any;
}>();

const value = defineModel<T>();

const ll = ref('');

const inputRef = useTemplateRef('input');

const show = ref(false);

// @ts-ignore
const { top, left, width, height } = useElementBounding(inputRef);

function select(item: T) {
  value.value = item;
}

watch(
  () => value.value,
  (v) => {
    ll.value = v?.[props.labelValue];
  },
);

const nextProps = computed<any>(() => {
  const op = { ...props };
  delete op.modelValue;
  return op;
});

const showItems = computed(() => {
  return props.items.filter((item) =>
    item[props.labelValue]?.toLowerCase()?.includes(ll.value?.toLowerCase()),
  );
});

function blur() {
  show.value = false;
  if (value.value && value.value[props.labelValue] !== ll.value) {
    value.value = {
      [props.keyValue]: '',
      [props.labelValue]: ll.value,
    } as T;
  }

  if (!value.value && ll.value) {
    value.value = {
      [props.keyValue]: '',
      [props.labelValue]: ll.value,
    } as T;
  }
}
</script>

<template>
  <UInput
    ref="input"
    v-bind="nextProps"
    v-model="ll"
    class="w-full"
    @blur="blur"
    @click="show = true"
  >
    <template v-if="!!slots.leading" #leading="{ ui }">
      <slot name="leading" :ui></slot>
    </template>

    <template v-if="!!slots.default" #default="{ ui }">
      <slot name="default" :ui></slot>
    </template>

    <template v-if="!!slots.trailing" #trailing="{ ui }">
      <slot name="trailing" :ui></slot>
    </template>
  </UInput>

  <Teleport to="body">
    <Transition name="scale">
      <div
        v-if="show && showItems.length"
        class="fixed z-10 bg-default shadow-lg rounded-md ring ring-default overflow-hidden pointer-events-auto overflow-y-auto px-2"
        :style="{
          'max-height': `${menuMaxHeight}px`,
          width: `${width}px`,
          left: `${left}px`,
          top: `${top + height + 5}px`,
        }"
      >
        <div
          v-for="(item, idx) in showItems"
          :key="idx"
          class="w-full my-1 cursor-pointer py-2 px-2 hover:bg-primary-50 rounded-md"
          @click="select(item)"
        >
          <slot name="item" :item="item"></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
.scale-enter-active,
.scale-leave-active {
  transition: opacity 0.15s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
}
</style>
