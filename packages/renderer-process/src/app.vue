<script setup lang="ts">
onMounted(() => {
  document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key === 'F12') {
      window.electronAPI.send('open-dev-tools');
    }
  });
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss"></style>
