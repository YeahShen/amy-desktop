<script setup lang="tsx">
// import { theme } from 'antdv-next';

onMounted(() => {
  document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key === 'F12') {
      window.electronAPI.send('open-dev-tools');
    }
  });
});

// const { isDark } = useColorMode();
</script>

<template>
  <a-config-provider :theme="{ zeroRuntime: true }">
    <a-app class="h-full">
      <div id="styw" class="w-full min-h-full h-fit">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>
    </a-app>
  </a-config-provider>
</template>

<style lang="scss"></style>
