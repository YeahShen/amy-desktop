<script setup lang="tsx">
import { message } from 'antdv-next';

onMounted(() => {
  document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key === 'F12') {
      window.electronAPI.send('open-dev-tools');
    }
  });
});

const [ContextHolder] = message.useMessage();
</script>

<template>
  <a-config-provider :theme="{ zeroRuntime: true }">
    <a-app class="h-full">
      <NuxtLayout>
        <ContextHolder />
        <NuxtPage />
      </NuxtLayout>
    </a-app>
  </a-config-provider>
</template>

<style lang="scss"></style>
