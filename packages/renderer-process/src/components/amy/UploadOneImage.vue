<script setup lang="tsx">
const props = withDefaults(
  defineProps<{
    processImageFn?: (file: string) => Promise<any>;
    wrapClasses?: string;
  }>(),
  {
    wrapClasses: 'w-30 aspect-square',
  },
);

const previewImg = ref<any>();
const fileBolb = defineModel<any>();

async function addImg() {
  const a = document.createElement('input');

  a.setAttribute('type', 'file');
  a.setAttribute('accept', 'image/jpeg,image/png,image/webp');

  a.addEventListener('change', function () {
    const file = this?.files?.[0];

    fileBolb.value = file;

    if (file) {
      const reader = new FileReader();

      props.processImageFn?.(window.electronAPI.getPathForFile(file));

      reader.onload = function (e) {
        previewImg.value = e?.target?.result;
      };
      reader.readAsDataURL(file);
    }
  });

  a.click();
}

function removeImg() {
  previewImg.value = undefined;
  fileBolb.value = undefined;
}
</script>

<template>
  <div
    :class="wrapClasses"
    class="border border-dashed rounded-xl border-muted flex items-center justify-center cursor-pointer hover:border-primary-border-hover hover:text-primary text-muted overflow-hidden px-0.5 py-0.5 relative bg-(--ant-color-bg-container)"
  >
    <div v-if="!previewImg" class="flex items-center w-full h-full justify-center" @click="addImg">
      <NuxtIcon name="amy:plus-outlined" />
    </div>

    <div v-else class="w-full h-full flex items-center justify-center rounded-xl overflow-hidden">
      <img class="w-full h-full" :src="previewImg" />
    </div>

    <div
      v-if="previewImg"
      class="absolute w-full h-full left-0 top-0 z-999 hover:bg-mask transition ease-in-out duration-100 flex items-center justify-center preview-mask"
    >
      <div class="op-wrap items-center">
        <AButton type="text" @click="addImg">
          <template #icon>
            <NuxtIcon name="amy:plus-outlined" class="text-white text-lg" />
          </template>
        </AButton>

        <AButton type="text" @click="removeImg">
          <template #icon>
            <NuxtIcon name="amy:trash-bin-trash-bold" class="text-white text-lg" />
          </template>
        </AButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.preview-mask {
  .op-wrap {
    display: none;
  }

  &:hover {
    .op-wrap {
      display: flex !important;
    }
  }
}
</style>
