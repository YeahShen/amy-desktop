import type { UploadTaskOptions } from '@amy/shared/types';

export const useTransmissionStore = defineStore('transmissionStore', () => {
  const uploadTasks = reactive<Record<string, UploadTaskOptions>>({});
  const finishTasks = reactive<Record<string, UploadTaskOptions>>({});

  onMounted(() => {
    window.electronAPI.invoke<UploadTaskOptions[]>('get-upload-tasks', 'x').then((res) => {
      res.forEach((task) => {
        uploadTasks[task.id] = task;
      });
    });

    window.electronAPI.invoke<UploadTaskOptions[]>('get-upload-tasks', 'finish').then((res) => {
      res.forEach((task) => {
        finishTasks[task.id] = task;
      });
    });

    window.electronAPI.on<any>('sync-upload-item', (item, rate) => {
      if (item.status === 'finish') {
        delete uploadTasks[item.id];
        finishTasks[item.id] = item;
        return;
      }

      uploadTasks[item.id] = {
        ...item,
        progressRate: rate,
      };
    });
  });

  const uploadList = computed(() => {
    return Object.values(uploadTasks);
  });

  const finishList = computed(() => {
    return Object.values(finishTasks);
  });

  return {
    uploadList,
    finishList,
  };
});
