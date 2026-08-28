import { app } from 'electron';
import path from 'node:path';
// import os from 'node:os';

import { Worker } from 'node:worker_threads';

export async function fullScreen() {
  // const platform = os.platform();

  const koffiPath = app.isPackaged
    ? path.resolve(app.getAppPath(), '..', 'koffi/index.cjs')
    : path.resolve(process.cwd(), 'resource', 'koffi', 'index.cjs');

  const workerFile = app.isPackaged
    ? path.resolve(app.getAppPath(), '..', 'full-screen.win32.js')
    : path.resolve(process.cwd(), 'resource', 'full-screen.win32.js');

  let listener: (msg: any) => void;

  function on(_listener: (msg: any) => void) {
    listener = _listener;
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(workerFile, { workerData: { koffiPath } });

    worker.on('error', reject); // 捕获 Worker 抛出的错误
    worker.on('exit', (code) => {
      // 监听 Worker 退出事件
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });

    worker.on('message', listener); // 接收 Worker 发回的结果

    resolve(on);
  });
}
