import { UploadStatus, UploadTaskOptions } from '@amy/shared/types';
import { Task } from './task';
import { getUploadTask, deleteTask as dt, insertTask } from './record';

const tasks = new Map<string, Task>();
const finishTasks: UploadTaskOptions[] = [];

export async function initRecordUploadTask() {
  const rows = await getUploadTask();

  for (const row of rows) {
    row.uploadedChunk = (row.uploadedChunk as string).split(',').map((i) => Number(i));

    if (row.status === 'finish') {
      finishTasks.push(row);
    } else {
      addTask(row, 'pause');
    }
  }
}

export function addTask(options: UploadTaskOptions, status: UploadStatus) {
  const task = new Task({ ...options, status });

  task.on('error', () => {});

  task.on('progress', () => {});

  task.on('record', () => {});

  tasks.set(options.id, task);

  startTask(task.id);

  insertTask(options);
}

export function pause(id: string) {
  const task = tasks.get(id);
  task?.pause();
}

export function deleteTask(id: string) {
  tasks.delete(id);
  dt(id);
}

export async function startTask(id: string) {
  const doingCount = Array.from(tasks).filter(([_key, value]) => {
    return (
      value.status === 'uploading' ||
      value.status === 'conversion' ||
      value.status === 'transcoding' ||
      value.status === 'merge'
    );
  }).length;

  if (doingCount < (await getSetting('uploadHugeFile.sameTimeUploadCount'))) {
    const task = tasks.get(id);
    task?.start();
  } else {
    const task = tasks.get(id);
    if (task) {
      task.status = 'wait';
    }
  }
}
