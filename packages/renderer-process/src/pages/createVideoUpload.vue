<script setup lang="ts">
import type { FormInstance } from 'antdv-next';
import type { Artist, VideoPublisher, VideoTag, VideoType } from '@amy/shared/types';

import { v4 } from 'uuid';

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
  poster: null as Blob | null,
  actors: [] as number[],
  publisher: null as string | null,
  publishDate: '',
  tags: [] as string[],
  size: 0,
  fileExt: '',
  filePath: route.query.filePath as string,
});

onMounted(() => {
  window.electronAPI.on<{
    category: string;
    title: string;
    fh: string;
    publishData: string;
    publisher: string;
    artist: string;
    type: string;
    posterData: {
      originalname: string;
      buffer: Buffer;
      mimetype: string;
    };
  }>('video-info', (info) => {
    const bytes = new Uint8Array(info.posterData.buffer);
    const blob = new Blob([bytes], { type: info.posterData.mimetype });

    form.poster = blob;
    form.title = info.title;
    form.publishDate = info.publishData;
    form.serialNumber = info.fh;

    // artists.value.filter()
    info.artist.split(',').forEach((a) => {
      const has = artists.value.find((b) => b.name === a);
      if (has) {
        form.actors.push(has.id);
      }
    });

    const type = types.value.find((t) => t.title === info.type);
    // @ts-ignore
    if (type) form.type = type.id;

    const ph = publisher.value.find(
      (p) => p.name === info.publisher || p.name.startsWith(info.publisher),
    );
    if (ph) {
      // @ts-ignore
      form.publisher = ph.id;
    } else {
      const id = '$$_' + v4();
      publisher.value.push({
        id: id,
        name: info.publisher,
      });
      form.publisher = id;
    }

    info.category.split(',').forEach((citem) => {
      const exist = tags.value.find((t) => t.title === citem);

      if (exist) {
        // @ts-ignore
        form.tags.push(exist.id);
      } else {
        const id = '$$_' + v4();

        tags.value.push({
          title: citem,
          id: id,
        });

        console.log(tags.value);

        form.tags.push(id);
      }
    });
  });

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

  const { name, ext, size } = window.electronAPI.parseFilePath(route.query.filePath as string);
  form.title = name;
  form.fileExt = ext;
  form.size = size;
});

const newTagName = ref('');
const newPublisherName = ref('');
async function addItem(e: MouseEvent) {
  e.preventDefault();
  tags.value.push({
    title: newTagName.value,
    id: '$$_' + v4(),
  });

  newTagName.value = '';
}

function addPublisher(e: MouseEvent) {
  e.preventDefault();
  publisher.value.push({
    id: '$$_' + v4(),
    name: newPublisherName.value,
  });

  newPublisherName.value = '';
}

async function commit() {
  await formRef.value?.validateFields();

  const fd = new FormData();
  fd.append('title', form.title);
  fd.append('description', form.description);
  fd.append('serialNumber', form.serialNumber);
  fd.append('type.id', form.type);
  fd.append('poster', form.poster as Blob);
  fd.append('fileExt', form.fileExt);

  form.actors.forEach((id, index) => {
    fd.append(`artist[${index}].id`, id + '');
  });

  if ((`${form.publisher}` || '').startsWith('$$')) {
    fd.append(
      `publisher.name`,
      publisher.value.find((p) => p.id == form.publisher)?.name as string,
    );
  } else {
    fd.append('publisher.id', form.publisher as string);
  }

  form.tags.forEach((t, index) => {
    if (!`${t}`.startsWith('$$')) {
      fd.append(`tag[${index}].id`, t);
    }
    fd.append(`tag[${index}].title`, tags.value.find((i) => i.id == t)?.title as string);
  });

  const id = await $request<string>('/video/createUploadTask', {
    method: 'POST',
    body: fd,
  });

  window.electronAPI.send('add-upload-task', {
    id: id,
    title: form.title,
    filePath: form.filePath,
    size: form.size,
    createdTime: v4(),
    author: form.actors.join(','),
  });

  useNotification().info(
    `<div>
     <p class="text-primary-active">上传任务: ${form.title}</p>
     <p>已添加<p/>
    </div>`,
  );
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
            label="番号"
            name="serialNumber"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :rules="[{ required: true, message: '番号不能为空' }]"
          >
            <AInput v-model:value="form.serialNumber" />
          </AFormItem>
        </a-col>

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
            <ASelect
              v-model:value="form.type"
              :options="types.map((item) => ({ label: item.title, value: item.id }))"
            />
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
