import { UploadTaskOptions } from '@amy/shared/types';

export function getUploadTask() {
  const db = getDB();

  return new Promise<UploadTaskOptions[]>((resolve, reject) => {
    db.all<UploadTaskOptions>(`SELECT * FROM upload_task where deleted = 0`, (err, rows) => {
      if (err) {
        console.error('查询失败:', err.message);
        reject();
      } else {
        console.log('查询结果:', rows);
        resolve(rows);
      }
    });
  });
}

export function deleteTask(id: string) {
  const db = getDB();
  db?.run('UPDATE upload_task SET deleted=1 where id=(?)', [id]);
}

export function insertTask(options: UploadTaskOptions) {}
