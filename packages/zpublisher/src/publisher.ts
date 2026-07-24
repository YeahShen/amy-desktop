import { PublisherBase, type PublisherOptions } from '@electron-forge/publisher-base';
import type { ForgeListrTaskDefinition } from '@electron-forge/shared-types';
import type { PublisherBitbucketConfig } from './config.ts';
import path from 'node:path';
import fs from 'node:fs';
import { ZipArchive } from 'archiver';
import axios from 'axios';

import { createTrackedPromise } from '@amy/shared';

import FormData from 'form-data';

const chunkSize = 1048576;

export default class PublisherBitbucket extends PublisherBase<PublisherBitbucketConfig> {
  name: string = 'amybucket';
  authHeaders: Record<string, string | number> = {};

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

    const authKey = Buffer.from(config.auth?.username + ':' + config.auth?.password).toString(
      'base64',
    );

    this.authHeaders = {
      Authorization: 'Bearer ' + authKey,
    };

    for (const makeResult of makeResults) {
      const { platform, arch, artifacts, packageJSON } = makeResult;

      const { version } = packageJSON;

      const zipFile = await new Promise<string>((resolve, reject) => {
        const dest = path.dirname(artifacts[0]);

        setStatusLine('压缩打包产物.');

        const outputZip = path.resolve(dest, 'artifact.zip');

        // 1. 创建写入流（用于输出 ZIP 文件）
        const output = fs.createWriteStream(outputZip);
        // 2. 创建 archiver 实例，指定格式为 zip，压缩级别为 9（最高）
        const archive = new ZipArchive({
          zlib: { level: 9 }, // Sets the compression level.
        });

        // 3. 监听事件
        output.on('close', () => {
          setStatusLine(`✅ 压缩完成！文件大小：${archive.pointer()} 字节`);
          resolve(outputZip);
        });

        archive.on('error', (err) => {
          reject(err);
        });

        // 4. 将 archiver 的流 管道（pipe）到 输出流
        archive.pipe(output);

        // 5. 添加文件夹到压缩包
        artifacts.forEach((artifact) => {
          archive.append(fs.createReadStream(artifact), { name: path.basename(artifact) });
        });

        archive.finalize();
      });

      const { size } = fs.statSync(zipFile);

      const totalChunks = Math.ceil(size / chunkSize);

      const prePublishData = {
        appName: config.appName,
        platform,
        arch,
        version,
        packageName: config.packageName,
        replaceExisting: !!config.replaceExist,
        totalChunks: String(totalChunks),
      };

      const { data: id } = await axios.post<string>(
        config.baseUrl + '/api/archive/pre-publish',
        prePublishData,
        {
          headers: {
            ...this.authHeaders,
          },
        },
      );

      const uploadArr = new Array(totalChunks)
        .fill(0)
        .map((_, index) => this.createUploadChunkFn(zipFile, index + 1, id))
        .map((fn) => fn());

      let finishCount = 0;

      do {
        finishCount = uploadArr.filter((t) => t.getStatus() !== 'pending').length;
        setStatusLine(`上传进度：${Number((finishCount / totalChunks).toFixed(2)) * 100} %`);
      } while (finishCount < totalChunks);

      setStatusLine('上传完成');
    }
  }

  createUploadChunkFn(filePath: string, chunkIndx: number, id: string) {
    return () =>
      createTrackedPromise((resolve, reject) => {
        const start = (chunkIndx - 1) * chunkSize;
        const end = start + chunkSize - 1;

        const stream = fs.createReadStream(filePath, {
          start,
          end,
          highWaterMark: end - start + 2,
        });

        const form = new FormData();

        form.append('id', id);
        form.append('chunk', stream);
        form.append('index', chunkIndx);

        axios
          .post(this.config.baseUrl + '/api/archive/upload-chunk', form, {
            headers: {
              ...form.getHeaders(),
              ...this.authHeaders,
            },
          })
          .then(resolve)
          .catch(reject);
      });
  }
}
