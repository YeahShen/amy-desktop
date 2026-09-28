import { PublisherBase, type PublisherOptions } from '@electron-forge/publisher-base';
import type { ForgeListrTaskDefinition } from '@electron-forge/shared-types';
import OSS from 'ali-oss';
import path from 'node:path';
import type { AliOssPublisherConfig } from './config';

import { createAuthAxios } from '@amy/shared';

/** 分片大小 1MB —— 安装包体积大，走分片上传以便断点与进度反馈 */
const DEFAULT_PART_SIZE = 1024 * 1024;
const DEFAULT_PARALLEL = 4;

/** 必填配置项，缺失时直接抛错而不是让 OSS 客户端在运行时莫名失败 */
const REQUIRED_KEYS = ['appName', 'region', 'accessKeyId', 'accessKeySecret', 'bucket'] as const;

const headers: Record<string, any> = {
  // 'x-oss-forbid-overwrite': true,
};

export default class AliOssPublisher extends PublisherBase<AliOssPublisherConfig> {
  name = 'alioss';

  async publish({
    makeResults,
    setStatusLine,
  }: PublisherOptions): Promise<ForgeListrTaskDefinition[] | void> {
    const { config } = this;

    if (!config) {
      throw new Error('AliOssPublisher 配置未设置！');
    }

    for (const key of REQUIRED_KEYS) {
      if (!config[key]) {
        throw new Error(`${key} 未设置！`);
      }
    }

    const { notify } = config;

    if (!notify) {
      setStatusLine('⚠ 未配置 notifyUrl，跳过发布通知');
    }

    const authAxios = notify
      ? createAuthAxios(
          notify.baseUrl,
          () =>
            'Bearer ' +
            Buffer.from(config.notify.username + ':' + config.notify.password).toString('base64'),
        )
      : null;

    const client = new OSS({
      region: config.region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      endpoint: config.endpoint,
      stsToken: config.stsToken,
      secure: config.secure ?? true,
      timeout: config.timeout,
    });

    if (!config.replaceExits) {
      headers['x-oss-forbid-overwrite'] = true;
    }

    const partSize = config.partSize ?? DEFAULT_PART_SIZE;
    const parallel = config.parallel ?? DEFAULT_PARALLEL;

    for (const makeResult of makeResults) {
      const { platform, arch, artifacts, packageJSON } = makeResult;

      const { version } = packageJSON;

      for (const artifact of artifacts) {
        const filename = path.basename(artifact);
        const objectKey = [config.appName, platform, arch, version, filename].join('/');

        setStatusLine(`上传中：${objectKey}`);

        try {
          await client.multipartUpload(objectKey, artifact, {
            partSize,
            parallel,
            headers,
            progress: (percentage: number) => {
              setStatusLine(`上传中：${objectKey} ${(Number(percentage) * 100).toFixed(2)}%`);
            },
          });
        } catch (error: any) {
          // 捕获服务端返回的 FileAlreadyExists 错误，视为跳过
          if (error.code === 'FileAlreadyExists') {
            setStatusLine(`文件已存在，跳过: ${filename}`);
          } else {
            throw new Error(`上传失败：${objectKey}，cause：${error.message}`);
          }
          // 其他错误则抛出
        }

        setStatusLine(`✅ 上传完成：${objectKey}`);
      }

      if (authAxios) {
        await authAxios.post('/api/archive/new-version', {
          appName: config.appName,
          platform,
          arch,
          version,
          packageName: config.packageName,
        });
      }

      setStatusLine(`✅ 发布完成`);
    }
  }
}
