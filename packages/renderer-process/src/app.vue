<script setup lang="tsx">
import { theme } from 'antdv-next';

onMounted(() => {
  document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key === 'F12') {
      window.electronAPI.send('open-dev-tools');
    }
  });
});

const { isDark } = useColorMode();
</script>

<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#28a17c',
      },
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }"
  >
    <a-app class="h-full">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </a-app>
  </a-config-provider>
</template>

<style lang="scss"></style>
