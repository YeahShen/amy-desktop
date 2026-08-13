<script setup lang="ts">
defineOptions({
  name: 'DialogFooter',
});

const props = withDefaults(
  defineProps<{
    comfirmText?: string;
    cnacelText?: string;
    comfirmFn?: () => Promise<any>;
  }>(),
  {
    cnacelText: '关闭',
    comfirmText: '确定',
    comfirmFn: () => Promise.resolve(),
  },
);

const comfirmLoading = ref(false);

const { close } = useDialog();

async function comfirm() {
  try {
    comfirmLoading.value = true;
    const res = await props.comfirmFn();
    close(res);
  } catch {
    comfirmLoading.value = false;
  }
}
</script>

<template>
  <Teleport to="#layout-dialog-footer">
    <div class="w-full shrink-0 flex items-center justify-between gap-2 px-4 py-4">
      <div class="w-fit h-full">
        <slot name="left" />
      </div>

      <div class="w-fit h-full">
        <slot>
          <div class="flex items-center gap-x-4">
            <u-button
              variant="outline"
              color="neutral"
              :ui="{
                base: 'px-5',
              }"
              @click="close"
              >{{ cnacelText }}</u-button
            >

            <u-button
              :ui="{
                base: 'px-5',
              }"
              :loading="comfirmLoading"
              @click="comfirm"
              >{{ comfirmText }}</u-button
            >
          </div>
        </slot>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss"></style>
