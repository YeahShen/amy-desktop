import { PublisherBase, type PublisherOptions } from '@electron-forge/publisher-base';
import type { ForgeListrTaskDefinition } from '@electron-forge/shared-types';
import type { PublisherBitbucketConfig } from './config.js';
import path from 'node:path';
import fs from 'node:fs';
import { makeZip } from './helper';

import FormData from 'form-data';

import { createAuthAxios, fileChunk, TaskScheduler } from '@amy/shared';

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

      const { data: id } = await authAxios.post<string>('/api/archive/pre-publish', prePublishData);

      const scheduler = new TaskScheduler<UploadChunkResult>({
        sameTimeTask: 10,
        loopInterval: 100,
      });

      for (let i = 1; i <= totalChunk; i++) {
        scheduler.addTask(function (resolve, reject) {
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
            .then(({ data }) => resolve(data))
            .catch((err) => reject({ err: err }));
        });
      }

      await new Promise((resolve) => {
        scheduler.on('over', () => {
          resolve(true);
        });

        scheduler.on('progressRate', (rate) => {
          setStatusLine('文件上传进度: ' + Math.floor(Number(rate.toFixed(4)) * 100) + '%');
        });

        scheduler.on('failTask', (res) => {
          console.log(res);
        });

        scheduler.startScheduler();
      });

      fs.unlinkSync(artifactZip);
    }
  }
}
