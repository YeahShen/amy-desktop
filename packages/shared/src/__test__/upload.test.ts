import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs, { createReadStream } from 'node:fs';
import path from 'node:path';
import { createAuthAxios } from '../utils/auth-axios';
import { createUploadFileFn } from '../utils/upload-file';
import { fileChunk, getFileSize } from '../utils/file';
import { Schedule } from '../utils/schedule';
import { createTrackedPromise } from '../utils/track-promise';

const filePath = 'C:\\Users\\ayuan\\Desktop\\windows-build.zip';

const chunkSize = 1048576;

describe('upload', () => {
  it('upload full file', async () => {
    const authAxios = createAuthAxios(
      'https://xx.ashen-station.top/',
      () => 'Bearer ' + Buffer.from('test:test').toString('base64'),
    );

    const { uploadFn } = createUploadFileFn(authAxios, '/api/archive/upload-test');

    const readerSteam = createReadStream(path.resolve(filePath));

    const res = uploadFn(readerSteam)();

    await res.promise;

    const result = res.getValue();

    expect(result).toBe(true);
  });

  it('file chunk number', () => {
    expect(getFileSize(filePath)).toBe(278574472);
  });

  it(
    'upload chunks',
    async () => {
      const { totalChunk, getChunk } = fileChunk(filePath, chunkSize);

      const authAxios = createAuthAxios(
        'http://127.0.0.1:8080',
        () => 'Bearer ' + Buffer.from('test:test').toString('base64'),
      );

      const { uploadFn } = createUploadFileFn<boolean>(authAxios, '/api/archive/upload-test');

      const uploadFns = new Array(totalChunk).fill(0).map((_, idx) => {
        const index = idx + 1;

        return uploadFn(getChunk(index), { index, id: 'xxdhkfjahkjds' });
      });

      const scedule = new Schedule({
        sameTimeTask: 10,
        taskList: uploadFns,
      });

      await new Promise((resolve) => {
        scedule.startSchedule();
        scedule.on('over', () => {
          resolve(1);
        });

        scedule.on('failTask', (p) => {
          scedule.pushTask(() => createTrackedPromise(p.getExecutor()));
        });
      });
    },
    {
      timeout: 60 * 10000,
    },
  );
});
