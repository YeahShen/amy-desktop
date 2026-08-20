<script setup lang="tsx">
const version = ref('');

onMounted(async () => {
  version.value = await window.electronAPI.invoke<string>('get-app-version');
});
</script>

<template>
  <div class="w-full h-full flex flex-col items-center justify-center gap-y-2.5 py-16">
    <NuxtIcon name="amy:logo-base" size="72" />

    <p class="about-title text-2xl font-bold mt-3">
      <span class="text-primary">AMY</span> STATIONS
    </p>

    <p class="text-sm text-toned">连接 AMY Station 的桌面客户端</p>

    <p class="text-xs text-dimmed">v{{ version }}</p>
  </div>
</template>

<style lang="scss">
.about-title {
  font-family: Orbitron, sans-serif !important;
  letter-spacing: 0.08em;
}
</style>
