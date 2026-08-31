import type { UploadTaskOptions } from '@amy/shared/types';

export const useTransmissionStore = defineStore('transmissionStore', () => {
  const uploadTasks = reactive<Record<string, UploadTaskOptions>>({});

  onMounted(() => {
    window.electronAPI.invoke<UploadTaskOptions[]>('get-upload-tasks', 'x').then((res) => {
      res.forEach((task) => {
        uploadTasks[task.id] = task;
      });
    });

    window.electronAPI.on<any>('sync-upload-item', (item, rate) => {
      uploadTasks[item.id] = {
        ...item,
        progressRate: rate,
      };
    });
  });

  const uploadList = computed(() => {
    return Object.values(uploadTasks);
  });

  return {
    uploadList,
  };
});
