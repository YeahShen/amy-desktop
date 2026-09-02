<script setup lang="ts">
import type { UploadTaskOptions } from '@amy/shared/types';

defineProps<{
  item: UploadTaskOptions;
}>();
</script>

<template>
  <div>{{ item }}</div>
</template>

<style lang="scss"></style>
