<script setup lang="ts">
const appStore = useAppStore();

function onClose() {
  appStore.drawer = {
    open: false,
    title: '',
    component: '',
  };
}

const transmissionStore = useTransmissionStore();
</script>

<template>
  <ClientOnly>
    <a-drawer
      v-model:open="appStore.drawer.open"
      title="Resizable Drawer"
      placement="right"
      size="600px"
      :resizable="false"
      class="z-9999"
      :styles="{
        header: {
          height: `var(--navbar-height)`,
          padding: '20px 20px 20px 16px',
        },
        title: {
          color: 'var(--ui-text)',
          fontWeight: 'normal',
          paddingLeft: '12px',
        },
        body: {
          padding: 0,
        },
      }"
      @close="onClose"
    >
      <template #title>{{ appStore.drawer.title }}</template>

      <div class="w-full h-full">
        <TransmissionList
          :upload-list="transmissionStore.uploadList"
          :finish-list="transmissionStore.finishList"
        />
      </div>
    </a-drawer>
  </ClientOnly>
</template>

<style lang="scss"></style>
