import { UploadStatus, UploadTaskOptions } from '@amy/shared/types';
import { BrowserWindow } from 'electron';
import { Task } from './task';
import { getUploadTask, deleteTask as dt, insertTask, updateTask } from './record';

import fs from 'node:fs';

const broadcastWindows = new Map<string, BrowserWindow>();
const tasks = new Map<string, Task>();
const finishTasks = new Map<string, UploadTaskOptions>();

export function addBroadcastWindows(id: string, w: BrowserWindow) {
  broadcastWindows.set(id, w);
}

export function removeBroadcastWindows(id: string) {
  broadcastWindows.delete(id);
}

export function emptyFinishTasks() {
  finishTasks.clear();
}

export async function initRecordUploadTask() {
  const rows = await getUploadTask();
  for (const row of rows) {
    if (row.status === 'finish') {
      finishTasks.set(row.id, row);
    } else {
      addTask(row, 'pause');
    }
  }
}

export function pause(id: string) {
  const task = tasks.get(id);
  task?.pause();
  startNextTask();
}

export function deleteTask(id: string) {
  const task = tasks.get(id);
  tasks.delete(id);

  task?.destroy();

  dt(id);
  startNextTask();
}

export function getTasks(type: 'finish' | 'x') {
  if (type === 'finish') {
    return Array.from(finishTasks).map(([_, __]) => __);
  } else {
    return Array.from(tasks).map(([_, __]) => __.getOption());
  }
}

export async function startTask(id: string) {
  const maxCount = (await getSetting('uploadHugeFile.sameTimeUploadCount')) || 5;
  const doingCount = getDodingCount();
  const task = tasks.get(id);
  if (task?.status === 'uploading') return;

  if (doingCount < maxCount) {
    task?.start();
  } else {
    if (task) {
      task.status = 'wait';
    }
  }

  return task?.getOption().status;
}

function getDodingCount() {
  return Array.from(tasks).filter(([_key, value]) => {
    return value.status === 'uploading';
  }).length;
}

export function addTask(options: UploadTaskOptions, status: UploadStatus, newTask = false) {
  // 文件不存在直接广播错误并跳过：不入内存、不落库、不启动（避免插入一个永远传不动的任务占并发槽）
  if (!fs.existsSync(options.filePath)) {
    broadcast(SEND_EVENT.ADD_UPLOAD_TASK_ERROR, { message: '文件不存在！' });
    return;
  }

  const uploadedChunk = options.uploadedChunk ?? [];

  const task = new Task({
    ...options,
    status,
    chunkSize: Number(FILE_UPLOAD_CHUNK_SIZE),
    uploadedChunk,
  });

  task.on('error', () => {
    broadcast(SEND_EVENT.REPORT_UPLOAD_ERROR, task.getOption());
    task.error();
    startNextTask();
  });

  task.on('progress', (r) => {
    broadcast(SEND_EVENT.AYNC_UPLOAD_ITEM, task.getOption(), r);
  });

  task.on('record', () => {
    const uploadedChunk = Array.from(task.uploadedChunk || []).join(',');
    updateTask(task.id, { uploadedChunk: uploadedChunk, status: task.status });
  });

  task.on('finish', () => {
    const finishTime = new Date().getTime();
    updateTask(task.id, { finishTime, status: 'finish' });

    finishTasks.set(task.id, { ...task.getOption(), finishTime });
    tasks.delete(task.id);

    startNextTask();
    broadcast(SEND_EVENT.AYNC_UPLOAD_ITEM, task.getOption(), 1);

    getNotificationWindow()?.webContents.send(SEND_EVENT.NOTIFY_MESSAGE, {
      type: 'success',
      message: `
          <div>
            <p class="text-primary-active">上传任务: ${task?.getOption().title}</p>
            <p>上传成功</p>
          </div>
        `,
    });
  });

  task.init();

  const old = tasks.get(options.id);
  if (old) {
    old.destroy();
  }

  tasks.set(options.id, task);

  if (newTask) {
    insertTask(task.getOption());
    startTask(task.id);
  }
}

async function startNextTask() {
  const maxCount = ((await getSetting('uploadHugeFile.sameTimeUploadCount')) as number) || 5;

  const waitTasks = Array.from(tasks).filter(([_key, value]) => {
    return value.status === 'wait';
  });

  while (getDodingCount() < maxCount && waitTasks.length > 0) {
    const nextTask = waitTasks.shift();
    if (nextTask) {
      const task = nextTask[1];
      task.start();
    }
  }
}

function broadcast(event: SEND_EVENT, ...args: any[]) {
  for (const [_id, w] of broadcastWindows) {
    w.webContents.send(event, ...args);
  }
}
