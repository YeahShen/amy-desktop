<script setup lang="tsx">
import { message } from 'antdv-next';

const props = withDefaults(
  defineProps<{
    hidCancelBtn?: boolean;
    hidConfirmBtn?: boolean;
    cancelBtnText?: string;
    confirmBtnText?: string;
    confirmFn?: () => Promise<any>;
  }>(),
  {
    cancelBtnText: '取消',
    confirmBtnText: '确定',
    confirmFn: () => Promise.resolve(),
  },
);

const { close } = useDialog();

const loading = ref(false);

async function comfirm() {
  loading.value = true;

  try {
    const result = await props.confirmFn();
    close(result);
  } catch (e: any) {
    message.error(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ClientOnly>
    <Teleport to="#dialog-footer-wrapper ">
      <div class="h-15 w-full flex items-center justify-between px-4">
        <div class="w-fit h-fit">
          <slot name="leftContext" />
        </div>
        <div class="w-fit h-fit">
          <slot name="rightContext">
            <div class="w-fit h-fit flex items-center gap-x-3">
              <AButton v-if="!hidCancelBtn" @click="close">{{ cancelBtnText }}</AButton>
              <AButton v-if="!hidConfirmBtn" type="primary" :loading="loading" @click="comfirm">{{
                confirmBtnText
              }}</AButton>
            </div>
          </slot>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style lang="scss"></style>
