<script setup lang="ts">
definePageMeta({
  layout: 'dialog',
  dialog: {
    title: '设置',
    minSizeAble: true,
  },
});
</script>

<template>
  <div>
    <div class="flex flex-col gap-6 p-4">
      <section class="flex flex-col gap-2">
        <h6 class="text-xs text-muted">外观</h6>
        <div
          class="flex items-center justify-between rounded-lg border border-default bg-card px-3 py-2.5"
        >
          <div class="flex flex-col gap-0.5">
            <span class="text-sm text-default">深色模式</span>
            <span class="text-xs text-muted">切换应用主题外观</span>
          </div>
          <AmySwitchColorMode />
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <h6 class="text-xs text-muted">关于</h6>
        <div
          class="flex items-center justify-between rounded-lg border border-default bg-card px-3 py-2.5"
        >
          <span class="text-sm text-default">版本</span>
          <span class="text-xs text-muted">v0.0.14</span>
        </div>
      </section>
    </div>

    <LayoutDialogFooter> </LayoutDialogFooter>
  </div>
</template>

<style lang="scss"></style>
