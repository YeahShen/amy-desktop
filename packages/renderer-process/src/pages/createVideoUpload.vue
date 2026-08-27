<script setup lang="ts">
import type { FormInstance } from 'antdv-next';
import type { VideoTag, VideoType } from '@amy/shared/types';

definePageMeta({
  layout: 'dialog',
  dialog: {
    title: '添加视频',
    minSizeAble: true,
  },
});

const route = useRoute();
const formRef = useTemplateRef<FormInstance>('formRef');

const tags = ref<VideoTag[]>([]);

const types = ref<VideoType[]>([]);

console.log(route.query.filePath);

const form = reactive({
  title: '',
  subtitle: '',
  serialNumber: '',
  type: '',
  poster: null,
  actors: [],
  publisher: null,
  tags: [],
  filePath: route.query.filePath as string,
});

onMounted(() => {
  $request<VideoTag[]>('/video/get-tags').then((res) => {
    tags.value = res;
  });

  $request<VideoType[]>('/video/get-types').then((res) => {
    types.value = res;
  });
});

async function commit() {
  await formRef.value?.validateFields();
}
</script>

<template>
  <div class="w-full h-full px-4">
    <AForm ref="formRef" :model="form" :label-col="{ span: 2 }" :validate-trigger="false">
      <a-row>
        <a-col :span="24">
          <AFormItem label="文件路径">
            <AInput v-model:value="form.filePath" readonly />
          </AFormItem>
        </a-col>

        <ACol :span="24">
          <AFormItem
            label="名称"
            name="title"
            :rules="[{ required: true, message: '标题不能为空' }]"
          >
            <AInput v-model:value="form.title" />
          </AFormItem>
        </ACol>
      </a-row>
    </AForm>

    <DialogFooter :confirm-fn="commit" />
  </div>
</template>

<style lang="scss"></style>
