import { app } from 'electron';
import path from 'node:path';

import log from 'electron-log';
import { Database } from 'sqlite3';

let db: Database;

export async function initDB() {
  const sqlite3 = await new Promise<typeof import('sqlite3')>((resolve, reject) => {
    try {
      // sqlite3 为 CJS 原生模块，仅能通过 require 加载；打包后经 extraResource 分发到 resources/sqlite3
      const modulePath = app.isPackaged
        ? path.resolve(app.getAppPath(), '..', 'sqlite3/lib/sqlite3.js')
        : path.resolve(app.getAppPath(), 'resource/sqlite3/lib/sqlite3.js');

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      resolve(require(modulePath));
    } catch (err) {
      reject(err);
    }
  }).catch((err) => {
    log.error('sqlite3 模块加载失败:', err);
    throw err;
  });

  const dbPath = path.join(app.getPath('userData'), 'data.db');

  console.log(dbPath);

  await new Promise((resolve, reject) => {
    // 2. 创建数据库连接
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        log.info('数据库连接失败:', err);
        reject();
      } else {
        log.info('数据库连接成功');
        resolve(true);
      }
    });
  });

  db.run(`CREATE TABLE IF NOT EXISTS upload_task (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  filePath TEXT NOT NULL,
  size INTEGER NOT NULL,
  chunkSize INTEGER NOT NULL,
  createdTime INTEGER NOT NULL,
  finishTime INTEGER,
  status TEXT,
  author INTEGER,
  uploadedChunk TEXT,
  deleted INTEGER
)`);
}

export function getDB() {
  return db;
}
