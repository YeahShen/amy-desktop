<script setup lang="tsx">
import type { ArtistCategory } from '@amy/shared/types';

definePageMeta({
  layout: 'dialog',
  dialog: {
    title: '创建艺术家',
  },
});

const formRef = useTemplateRef('formRef');

const form = reactive({
  name: '',
  category: null,
  description: '',
  avatarFile: null,
});

const categoryList = ref<ArtistCategory[]>([]);

onMounted(async () => {
  categoryList.value = await $request<ArtistCategory[]>('/artist/category/list');
});

async function confirm() {
  try {
    const values = await formRef.value?.validateFields?.();
    console.log('Success:', values);
  } catch (errorInfo) {
    console.log('Failed:', errorInfo);

    throw new Error(errorInfo);
  }
}
</script>

<template>
  <div class="w-full h-full px-4">
    <AForm ref="formRef" :model="form">
      <AFormItem label="名称" name="name" :rules="[{ required: true, message: '名称不能为空' }]">
        <AInput v-model:value="form.name" />
      </AFormItem>

      <AFormItem
        label="类别"
        name="category"
        :rules="[{ required: true, message: '类别不能为空' }]"
      >
        <a-auto-complete
          v-model:value="form.category"
          :options="categoryList.map((item) => ({ label: item.title, value: item.id }))"
        />
      </AFormItem>

      <AFormItem label="描述" name="description">
        <a-textarea v-model:value="form.description" :rows="3" />
      </AFormItem>

      <AFormItem
        label="头像"
        name="avatarFile"
        :rules="[{ required: true, message: '头像不能为空' }]"
      >
        <AmyUploadOneImage v-model="form.avatarFile" />
      </AFormItem>
    </AForm>

    <DialogFooter :confirm-fn="confirm" hid-error-message />
  </div>
</template>

<style lang="scss"></style>
0p
