<script setup lang="ts">
import type { FormInstance } from 'antdv-next';
import type { ArtistCategory } from '@amy/shared/types';

definePageMeta({
  layout: 'dialog',
  dialog: {
    title: '创建艺术家',
  },
});

const formRef = useTemplateRef<FormInstance>('formRef');

const form = reactive({
  name: '',
  category: '',
  description: '',
  avatarFile: '',
});

const categoryEntity = ref<ArtistCategory>();

const category = computed({
  get() {
    return form.category;
  },
  set(key: string) {
    const item = categoryList.value.find((i) => i.title === key);

    if (item) {
      form.category = item.title;
      categoryEntity.value = item;
    } else {
      form.category = key;
      categoryEntity.value = {
        id: 0,
        title: key,
      };
    }
  },
});

const categoryList = ref<ArtistCategory[]>([]);

onMounted(async () => {
  categoryList.value = await $request<ArtistCategory[]>('/artist/category/list');
});

async function confirm() {
  await formRef.value?.validateFields();
  const fd = new FormData();
  fd.append('name', form.name);
  fd.append('description', form.description + '');
  fd.append('avatarFile', form.avatarFile as string);
  if (categoryEntity.value?.id) {
    fd.append('category.id', categoryEntity.value?.id + '');
  }

  fd.append('category.title', categoryEntity.value?.title + '');

  await $request('/artist/add', {
    method: 'POST',
    body: fd,
  });
}
</script>

<template>
  <div class="w-full h-full px-4">
    <AForm ref="formRef" :model="form" :label-col="{ span: 2 }">
      <AFormItem label="名称" name="name" :rules="[{ required: true, message: '名称不能为空' }]">
        <AInput v-model:value="form.name" />
      </AFormItem>

      <AFormItem
        label="类别"
        name="category"
        :rules="[{ required: true, message: '类别不能为空' }]"
      >
        <a-auto-complete
          v-model:value="category"
          :options="categoryList.map((item) => ({ value: item.title }))"
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
