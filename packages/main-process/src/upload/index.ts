import { UploadStatus, UploadTaskOptions } from '@amy/shared/types';
import { Task } from './task';
import { getUploadTask, deleteTask as dt, insertTask, updateTask } from './record';
import { BrowserWindow } from 'electron';

const tasks = new Map<string, Task>();
const finishTasks: UploadTaskOptions[] = [];
const broadcastWindows = new Map<string, BrowserWindow>();

export function addBroadcastWindows(id: string, w: BrowserWindow) {
  broadcastWindows.set(id, w);
}

export function removeBroadcastWindows(id: string) {
  broadcastWindows.delete(id);
}

export async function initRecordUploadTask() {
  const rows = await getUploadTask();

  for (const row of rows) {
    row.uploadedChunk = row.uploadedChunk
      ? (row.uploadedChunk as string).split(',').map((i) => Number(i))
      : [];

    if (row.status === 'finish') {
      finishTasks.push(row);
    } else {
      addTask(row, 'pause');
    }
  }
}

export function addTask(options: UploadTaskOptions, status: UploadStatus) {
  const task = new Task({ ...options, status });

  task.on('error', (t) => {
    Array.from(broadcastWindows).forEach(([_k, win]) => {
      win.webContents.send(SEND_EVENT.REPORT_UPLOAD_ERROR, t);
    });
  });

  task.on('progress', (t, r) => {
    Array.from(broadcastWindows).forEach(([_k, win]) => {
      win.webContents.send(SEND_EVENT.AYNC_UPLOAD_ITEM, t, r);
    });
  });

  task.on('record', (t) => {
    updateTask(t.id, { uploadedChunk: t.uploadedChunk, status: t.status });
  });

  task.on('status', async (id, status) => {
    if (status === 'finish') {
      updateTask(id, { status, finishTime: new Date().getTime() });

      const task = tasks.get(id);
      if (task) {
        finishTasks.push(task.getOption());
        tasks.delete(id);
      }

      const waitingTask = Array.from(tasks)
        .filter(([_key, task]) => task.status === 'wait')
        .map(([_key, task]) => task);
      const doingCount = getDodingCount();

      const idleCount = (await getSetting('uploadHugeFile.sameTimeUploadCount')) - doingCount;
      if (idleCount > 0 && waitingTask.length > 0) {
        waitingTask.splice(0, idleCount).forEach((task) => task.start());
      }
    }
  });

  tasks.set(options.id, task);

  startTask(task.id);

  insertTask(task.getOption());
}

export function pause(id: string) {
  const task = tasks.get(id);
  task?.pause();
}

export function deleteTask(id: string) {
  const task = tasks.get(id);
  tasks.delete(id);

  task?.destroy();

  dt(id);
}

export async function startTask(id: string) {
  const doingCount = getDodingCount();

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

export async function syncTaskStatus(data: { status: UploadStatus; id: string; rate: number }) {
  const task = tasks.get(data.id);

  if (task) {
    task.syncMessage(data.status, data.rate);
  }
}

function getDodingCount() {
  return Array.from(tasks).filter(([_key, value]) => {
    return (
      value.status === 'uploading' ||
      value.status === 'conversion' ||
      value.status === 'transcoding' ||
      value.status === 'merge'
    );
  }).length;
}
