<script setup lang="tsx">
import { useElementSize } from '@vueuse/core';

const dialogFooterRef = useTemplateRef('dialogFooterRef');

const { height } = useElementSize(dialogFooterRef);
</script>

<template>
  <div class="w-full h-full dialog-wrap flex flex-col">
    <DialogHeader />

    <div class="w-full relative" :style="{ height: `calc(100% - 64px - ${height}px)` }">
      <NuxtPage />
    </div>

    <div id="dialog-footer-wrapper" ref="dialogFooterRef"></div>
  </div>
</template>
