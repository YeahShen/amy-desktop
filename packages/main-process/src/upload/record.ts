import { UploadTaskOptions } from '@amy/shared/types';

// uploadedChunk 落库统一格式：number[] → 逗号分隔字符串（与读取侧 split(',') 契约一致，见 index.ts initRecordUploadTask）
function serializeUploadedChunk(uploadedChunk: UploadTaskOptions['uploadedChunk']) {
  return Array.isArray(uploadedChunk) ? uploadedChunk.join(',') : uploadedChunk;
}

// 可更新的列（对应 upload_task 表非主键、非 deleted 字段）
type UpdatableTaskOptions = Pick<
  UploadTaskOptions,
  | 'title'
  | 'filePath'
  | 'size'
  | 'chunkSize'
  | 'createdTime'
  | 'finishTime'
  | 'status'
  | 'author'
  | 'uploadedChunk'
>;

export function getUploadTask() {
  const db = getDB();

  return new Promise<UploadTaskOptions[]>((resolve, reject) => {
    db.all<UploadTaskOptions>(`SELECT * FROM upload_task where deleted = 0`, (err, rows) => {
      if (err) {
        console.error('查询失败:', err.message);
        reject();
      } else {
        resolve(rows);
      }
    });
  });
}

export function deleteTask(id: string) {
  const db = getDB();
  db?.run('UPDATE upload_task SET deleted=1 where id=(?)', [id]);
}

export function insertTask(options: UploadTaskOptions) {
  const db = getDB();
  const uploadedChunk = serializeUploadedChunk(options.uploadedChunk);

  // INSERT OR REPLACE：重启时 initRecordUploadTask 会重放存量任务，需幂等 upsert
  db?.run(
    `INSERT OR REPLACE INTO upload_task (
      id, title, filePath, size, chunkSize, createdTime, finishTime, status, author, uploadedChunk, deleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      options.id,
      options.title,
      options.filePath,
      options.size,
      options.chunkSize,
      options.createdTime,
      options.finishTime,
      options.status,
      options.author,
      uploadedChunk,
    ],
    (err) => {
      if (err) console.error('插入上传任务失败:', err.message);
    },
  );
}

export function updateTask(id: string, patch: Partial<UpdatableTaskOptions>) {
  const db = getDB();

  const sets: string[] = [];
  const params: (string | number)[] = [];

  // 只更新调用方提供的字段，避免 record 事件携带的旧 status 误覆盖实时状态
  (Object.keys(patch) as (keyof UpdatableTaskOptions)[]).forEach((key) => {
    const value = patch[key];
    if (value === undefined) return;

    sets.push(`${key} = ?`);
    params.push(
      key === 'uploadedChunk'
        ? serializeUploadedChunk(value as UploadTaskOptions['uploadedChunk'])
        : (value as string | number),
    );
  });

  if (sets.length === 0) return;

  db?.run(`UPDATE upload_task SET ${sets.join(', ')} WHERE id = ?`, [...params, id], (err) => {
    if (err) console.error('更新上传任务失败:', err.message);
  });
}
