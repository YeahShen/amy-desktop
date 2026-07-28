import { PublisherBase, type PublisherOptions } from '@electron-forge/publisher-base';
import type { ForgeListrTaskDefinition } from '@electron-forge/shared-types';
import type { PublisherBitbucketConfig } from './config.js';
import path from 'node:path';
import fs from 'node:fs';

import FormData from 'form-data';

import { createAuthAxios, fileChunk, TaskScheduler, makeZip } from '@amy/shared';
import { AxiosInstance } from 'axios';

const chunkSize = 1048576;

type UploadChunkResult = {
  status: boolean;
};

export default class PublisherBitbucket extends PublisherBase<PublisherBitbucketConfig> {
  name: string = 'amyBitbucket';

  async publish({
    makeResults,
    setStatusLine,
  }: PublisherOptions): Promise<ForgeListrTaskDefinition[] | void> {
    const { config } = this;

    if (!config.baseUrl) {
      throw new Error('baseUrl 未设置！');
    }

    if (!config.packageName) {
      throw new Error('packageName 未设置！');
    }

    if (!config.auth?.password || !config.auth?.username) {
      throw new Error('username 或 password 未设置！');
    }

    const authAxios = createAuthAxios(
      config.baseUrl,
      () =>
        'Bearer ' +
        Buffer.from(config.auth?.username + ':' + config.auth?.password).toString('base64'),
    );

    for (const makeResult of makeResults) {
      const { platform, arch, artifacts, packageJSON } = makeResult;

      const { version } = packageJSON;

      const dest = path.dirname(artifacts[0]);

      setStatusLine('压缩打包产物.');

      const artifactZip = path.resolve(dest, 'artifact.zip');

      try {
        const archive = await makeZip(
          fs.readdirSync(dest).map((i) => path.resolve(dest, i)),
          artifactZip,
        );
        setStatusLine(`✅ 压缩完成！文件大小：${archive.pointer()} 字节`);
      } catch (e: any) {
        setStatusLine('cuowu ' + e.message);
      }

      const { getChunk, totalChunk } = fileChunk(artifactZip, chunkSize);

      const prePublishData = {
        appName: config.appName,
        platform,
        arch,
        version,
        packageName: config.packageName,
        replaceExisting: !!config.replaceExist,
        totalChunks: String(totalChunk),
      };

      let id: string = '';

      try {
        const { data } = await authAxios.post<string>('/api/archive/pre-publish', prePublishData);

        id = data;
      } catch (e: any) {
        console.log(e);
      }

      await this.uploadScheduler(getChunk, totalChunk, id, authAxios, setStatusLine);

      await new Promise(async (resolve) => {
        const { data } = await authAxios<{ intact: boolean; loseChunks: number[] }>(
          '/api/archive/checkout-chunks',
          {
            method: 'get',
            params: {
              id,
            },
          },
        );

        if (data.intact) resolve(true);
        else {
          this.uploadScheduler(getChunk, totalChunk, id, authAxios, setStatusLine).then(resolve);
        }
      });

      fs.unlinkSync(artifactZip);

      try {
        await authAxios.get('/api/archive/finish', {
          params: {
            id,
          },
        });

        setStatusLine('发布完成');
      } catch (e: any) {
        console.log({ ...e });

        throw new Error('发布失败，cause：' + e.message);
      }
    }
  }

  uploadScheduler(
    getChunk: (index: number) => fs.ReadStream,
    totalChunk: number,
    id: string,
    authAxios: AxiosInstance,
    setStatusLine: (msg: string) => void,
  ) {
    return new Promise((resolve) => {
      const scheduler = new TaskScheduler<UploadChunkResult>({
        sameTimeTask: 10,
        loopInterval: 100,
        retries: 5,
      });

      for (let i = 1; i <= totalChunk; i++) {
        scheduler.addTask(function (r1, r2) {
          const chunk = getChunk(i);

          const form = new FormData();
          form.append('id', id);
          form.append('chunk', chunk);
          form.append('index', i);

          authAxios
            .post<UploadChunkResult>('/api/archive/upload-chunk', form, {
              headers: {
                ...form.getHeaders(),
              },
            })
            .then(({ data }) => r1(data))
            .catch((err) => r2({ err: err }));
        });
      }

      scheduler.on('over', () => {
        resolve(true);
      });

      scheduler.on('progressRate', (rate) => {
        setStatusLine('文件上传进度: ' + Math.floor(Number(rate.toFixed(4)) * 100) + '%');
      });

      scheduler.startScheduler();
    });
  }
}
