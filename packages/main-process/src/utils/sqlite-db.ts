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

      console.log(modulePath);

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

  // 2. 创建数据库连接
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      log.info('数据库连接失败:', err);
    } else {
      log.info('数据库连接成功');
    }
  });
}

export function getDB() {
  return db;
}
