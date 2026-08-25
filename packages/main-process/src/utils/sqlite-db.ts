import { app } from 'electron';
import path from 'node:path';

import log from 'electron-log';

export async function initDB() {
  const sqlite3 = await new Promise<typeof import('sqlite3')>((resolve) => {
    if (app.isPackaged) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- koffi 为 CJS 原生模块，打包后仅能通过 require 加载
      resolve(require(path.resolve(app.getAppPath(), '..', 'sqlite3/lib/sqlite3.js')));
    } else {
      import('sqlite3').then((res) => {
        resolve(res);
      });
    }
  });

  log.info(sqlite3);

  const dbPath = path.join(app.getPath('userData'), 'data.db');

  // 2. 创建数据库连接
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      log.info('数据库连接失败:', err);
    } else {
      log.info('数据库连接成功');
    }
  });

  return db;
}
