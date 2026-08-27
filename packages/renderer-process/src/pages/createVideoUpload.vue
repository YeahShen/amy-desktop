<script setup lang="ts">
import type { FormInstance } from 'antdv-next';
import type { Artist, VideoPublisher, VideoTag, VideoType } from '@amy/shared/types';

definePageMeta({
  layout: 'dialog',
  dialog: {
    title: '添加视频',
    minSizeAble: true,
  },
});

const route = useRoute();
const formRef = useTemplateRef<FormInstance>('formRef');
const artists = ref<Artist[]>([]);

const tags = ref<VideoTag[]>([]);
const publisher = ref<VideoPublisher[]>([]);
const types = ref<VideoType[]>([]);

const form = reactive({
  title: '',
  description: '',
  serialNumber: '',
  type: '',
  poster: null,
  actors: [],
  publisher: null,
  tags: [],
  fileExt: '',
  filePath: route.query.filePath as string,
});

onMounted(() => {
  $request<VideoTag[]>('/video/get-tags').then((res) => {
    tags.value = res;
  });

  $request<VideoType[]>('/video/get-types').then((res) => {
    types.value = res;
  });

  $request<VideoPublisher[]>('/video/get-publisher').then((res) => {
    publisher.value = res;
  });

  $request<Artist[]>('/artist/all').then((res) => {
    artists.value = res;
  });

  const { name, ext } = window.electronAPI.parseFilePath(route.query.filePath as string);
  form.title = name;
  form.fileExt = ext;
});

const newTagName = ref('');
const newPublisherName = ref('');
async function addItem(e: MouseEvent) {
  e.preventDefault();
  tags.value.push({
    title: newTagName.value,
    id: '$$_' + new Date().getTime(),
  });

  newTagName.value = '';
}

function addPublisher(e: MouseEvent) {
  e.preventDefault();
  publisher.value.push({
    id: '$$_' + new Date().getTime(),
    name: newPublisherName.value,
  });

  newPublisherName.value = '';
}

async function commit() {
  await formRef.value?.validateFields();
}
</script>

<template>
  <div class="w-full h-full px-4">
    <AForm ref="formRef" :model="form" :label-col="{ span: 3 }" :validate-trigger="false">
      <AFormItem label="文件路径">
        <AInput v-model:value="form.filePath" readonly />
      </AFormItem>

      <AFormItem
        label="视频标题"
        name="title"
        :rules="[{ required: true, message: '标题不能为空' }]"
      >
        <AInput v-model:value="form.title" />
      </AFormItem>

      <AFormItem label="视频描述">
        <ATextarea v-model:value="form.description" :rows="2" />
      </AFormItem>

      <AFormItem label="视频标签" :rules="[{ required: true, message: '视频类型' }]">
        <ASelect
          v-model:value="form.tags"
          :options="tags.map((i) => ({ label: i.title, value: i.id }))"
          mode="multiple"
        >
          <template #popupRender="menu">
            <component :is="menu" />
            <a-divider style="margin: 8px 0" />
            <a-space style="padding: 0 8px 4px">
              <a-input v-model:value="newTagName" placeholder="新标签" @keydown.stop />
              <a-button @click="addItem">
                <template #icon>
                  <NuxtIcon name="amy:add" />
                </template>
                新增
              </a-button>
            </a-space>
          </template>
        </ASelect>
      </AFormItem>

      <AFormItem label="艺术家" :rules="[{ required: true, message: '艺术家' }]">
        <ASelect
          v-model:value="form.actors"
          mode="multiple"
          :options="artists.map((item) => ({ label: item.name, value: item.id, data: item }))"
        >
          <template #optionRender="{ option }">
            <div class="flex items-center gap-x-2">
              <a-avatar v-if="option.data.data.avatar" :src="option.data.data.avatar" />
              {{ option.data.label }}
            </div>
          </template>
        </ASelect>
      </AFormItem>

      <a-row :gutter="16">
        <a-col :span="12">
          <AFormItem
            label="出版社"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :rules="[{ required: true, message: '出版社' }]"
          >
            <ASelect
              v-model:value="form.publisher"
              :options="publisher.map((i) => ({ label: i.name, value: i.id }))"
            >
              <template #popupRender="menu">
                <component :is="menu" />
                <a-divider style="margin: 8px 0" />
                <a-space style="padding: 0 8px 4px">
                  <a-input v-model:value="newPublisherName" placeholder="新出版社" @keydown.stop />
                  <a-button @click="addPublisher">
                    <template #icon>
                      <NuxtIcon name="amy:add" />
                    </template>
                    新增
                  </a-button>
                </a-space>
              </template>
            </ASelect>
          </AFormItem>
        </a-col>

        <a-col :span="12">
          <AFormItem
            label="视频类型"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :rules="[{ required: true, message: '视频类型' }]"
          >
            <ASelect :options="types.map((item) => ({ label: item.title, value: item.id }))" />
          </AFormItem>
        </a-col>
      </a-row>

      <AFormItem label="视频海报">
        <AmyUploadOneImage v-model="form.poster" wrap-classes="w-50 aspect-[1.77]" />
      </AFormItem>
    </AForm>

    <DialogFooter :confirm-fn="commit" />
  </div>
</template>

<style lang="scss"></style>
