import { UploadStatus, UploadTaskOptions } from '@amy/shared/types';
import { Task } from './task';

// import x from 'node:sqlite';

const tasks = new Map<string, Task>();
// const finishTasks: UploadTaskOptions[] = [];

export function initRecordUploadTask() {}

export function addTask(options: UploadTaskOptions, status: UploadStatus) {
  const task = new Task({ ...options, status });

  task.on('error', () => {});

  task.on('progress', () => {});

  task.on('record', () => {});

  tasks.set(options.id, task);
}

export function pause(id: string) {
  const task = tasks.get(id);
  task?.pause();
}

export function deleteTask(id: string) {
  tasks.delete(id);
}

export function startTask(id: string) {}
