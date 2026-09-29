<script setup lang="ts">
definePageMeta({
  workspace: 'artist',
  keepalive: true,
});

const loading = ref(true);

setTimeout(() => {
  loading.value = false;
}, 3000);
</script>

<template>
  <LayoutPage
    :classes="{
      content: 'px-4',
    }"
  >
    <template #navbar-content> </template>

    <div v-for="i in 2" :key="i" class="w-full h-fit relative">
      <div class="sticky top-(--navbar-height) w-full bg-container z-99 flex items-center h-10">
        <a-skeleton
          :loading
          :paragraph="false"
          active
          :styles="{
            title: {
              width: '180px',
              height: '22px',
            },
          }"
        >
          <p class="text-muted">hmr update 测试</p>
        </a-skeleton>
      </div>
    </div>
  </LayoutPage>
</template>

<style lang="scss"></style>
