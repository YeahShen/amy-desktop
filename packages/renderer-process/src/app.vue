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

const token = computed(() => {
  if (isDark.value) {
    return theme.darkAlgorithm({
      ...theme.getDesignToken(),
      colorPrimary: '#28a17c',
    });
  }

  return theme.defaultAlgorithm({
    ...theme.getDesignToken(),
    colorPrimary: '#28a17c',
  });
});
</script>

<template>
  <a-config-provider
    :theme="{
      token: token,
    }"
  >
    <a-app>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </a-app>
  </a-config-provider>
</template>

<style lang="scss"></style>
