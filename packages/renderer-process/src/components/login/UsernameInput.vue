<script setup lang="ts">
import type { UserloggedCacheItem } from '@amy/shared';

defineProps<{
  loggedItems: UserloggedCacheItem[];
}>();

const emits = defineEmits<{
  setPassword: [string];
}>();

const username = defineModel<string>({
  default: () => '',
});

const v = ref();

watch(
  () => v.value,
  (val) => {
    emits('setPassword', val.password);
    username.value = val.account;
  },
);
</script>

<template>
  <AmyCombobox
    v-model="v"
    :items="loggedItems"
    :menu-max-height="200"
    label-value="account"
    key-value="account"
  >
    <template #leading>
      <UIcon name="i-ant-design:user-outlined" class="size-5" />
    </template>

    <template #item="{ item }">
      <div>
        {{ item.account }}
      </div>
    </template>
  </AmyCombobox>
</template>

<style lang="scss"></style>
