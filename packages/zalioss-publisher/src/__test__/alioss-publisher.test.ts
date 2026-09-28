import { describe, it, beforeEach, expect, vi } from 'vitest';
import path from 'node:path';
import type { PublisherOptions } from '@electron-forge/publisher-base';
import type { ForgeMakeResult, ResolvedForgeConfig } from '@electron-forge/shared-types';

import AliOssPublisher from '../publisher';
import type { AliOssPublisherConfig } from '../config';

const mocks = vi.hoisted(() => {
  const constructedOptions: any[] = [];
  const multipartUpload = vi.fn();
  const notifyPost = vi.fn();
  const createAuthAxios = vi.fn((_baseUrl: string, _getToken: () => string) => ({
    post: notifyPost,
  }));

  class OssClient {
    multipartUpload = multipartUpload;
    constructor(options: any) {
      constructedOptions.push(options);
    }
  }

  return { constructedOptions, multipartUpload, notifyPost, createAuthAxios, OssClient };
});

vi.mock('ali-oss', () => ({ default: mocks.OssClient }));
vi.mock('@amy/shared', () => ({ createAuthAxios: mocks.createAuthAxios }));

const makeDir = path.join('/out', 'make', 'squirrel.windows', 'x64');
const version = '0.1.23';

const baseConfig: AliOssPublisherConfig = {
  appName: 'AMY STATIONS',
  region: 'oss-cn-hangzhou',
  accessKeyId: 'ak',
  accessKeySecret: 'sk',
  bucket: 'amy-release',
  packageName: 'site.ashenstation.amy',
  notify: {
    baseUrl: 'https://release.example.com',
    username: 'ak',
    password: 'sk',
  },
};

function createOptions(makeResults: ForgeMakeResult[]) {
  const setStatusLine = vi.fn();

  const options: PublisherOptions = {
    dir: makeDir,
    makeResults,
    forgeConfig: {} as ResolvedForgeConfig,
    setStatusLine,
  };

  return { options, setStatusLine };
}

describe('AliOssPublisher', () => {
  let makeResults: ForgeMakeResult[];

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.constructedOptions.length = 0;
    mocks.multipartUpload.mockResolvedValue({ name: 'ok' });
    mocks.notifyPost.mockResolvedValue({ data: {} });

    makeResults = [
      {
        artifacts: [
          path.join(makeDir, 'RELEASES'),
          path.join(makeDir, 'amy_main_process-0.1.23-full.nupkg'),
          path.join(makeDir, 'AMY STATIONS-0.1.23 Setup.exe'),
        ],
        packageJSON: { name: 'amy-main-process', version },
        platform: 'win32',
        arch: 'x64',
      },
    ];
  });

  it('缺少必填配置时抛错', async () => {
    for (const key of ['appName', 'region', 'accessKeyId', 'accessKeySecret', 'bucket'] as const) {
      const publisher = new AliOssPublisher({ ...baseConfig, [key]: '' });
      const { options } = createOptions(makeResults);

      await expect(publisher.publish(options)).rejects.toThrow(`${key} 未设置！`);
    }

    expect(mocks.multipartUpload).not.toHaveBeenCalled();
  });

  it('按 {appName}/{platform}/{arch}/{version}/{filename} 布局上传每个产物', async () => {
    const publisher = new AliOssPublisher(baseConfig);
    const { options } = createOptions(makeResults);

    await publisher.publish(options);

    const uploadedKeys = mocks.multipartUpload.mock.calls.map(([key]) => key);

    expect(uploadedKeys).toEqual([
      `AMY STATIONS/win32/x64/${version}/RELEASES`,
      `AMY STATIONS/win32/x64/${version}/amy_main_process-0.1.23-full.nupkg`,
      `AMY STATIONS/win32/x64/${version}/AMY STATIONS-0.1.23 Setup.exe`,
    ]);
  });

  it('上传的本地路径为产物完整路径', async () => {
    const publisher = new AliOssPublisher(baseConfig);
    const { options } = createOptions(makeResults);

    await publisher.publish(options);

    const uploadedFiles = mocks.multipartUpload.mock.calls.map(([, file]) => file);

    expect(uploadedFiles).toEqual(makeResults[0].artifacts);
  });

  it('多个 platform/arch 各自成目录', async () => {
    const publisher = new AliOssPublisher(baseConfig);
    const { options } = createOptions([
      ...makeResults,
      {
        artifacts: [path.join(makeDir, 'amy_0.1.23_amd64.deb')],
        packageJSON: { name: 'amy-main-process', version },
        platform: 'linux',
        arch: 'arm64',
      },
    ]);

    await publisher.publish(options);

    const uploadedKeys = mocks.multipartUpload.mock.calls.map(([key]) => key);

    expect(uploadedKeys).toContain(`AMY STATIONS/linux/arm64/${version}/amy_0.1.23_amd64.deb`);
  });

  it('默认以 HTTPS 1MB 分片 4 并发建客户端，可选配置可覆盖', async () => {
    await new AliOssPublisher(baseConfig).publish(createOptions(makeResults).options);

    expect(mocks.constructedOptions[0]).toMatchObject({
      region: 'oss-cn-hangzhou',
      accessKeyId: 'ak',
      accessKeySecret: 'sk',
      bucket: 'amy-release',
      secure: true,
    });
    expect(mocks.multipartUpload.mock.calls[0][2]).toMatchObject({
      partSize: 1024 * 1024,
      parallel: 4,
    });

    await new AliOssPublisher({
      ...baseConfig,
      endpoint: 'https://oss.example.com',
      secure: false,
      stsToken: 'token',
      partSize: 512 * 1024,
      parallel: 8,
    }).publish(createOptions(makeResults).options);

    expect(mocks.constructedOptions[1]).toMatchObject({
      endpoint: 'https://oss.example.com',
      secure: false,
      stsToken: 'token',
    });
    expect(mocks.multipartUpload.mock.calls[3][2]).toMatchObject({
      partSize: 512 * 1024,
      parallel: 8,
    });
  });

  it('通过 progress 回调上报上传进度', async () => {
    mocks.multipartUpload.mockImplementation(async (_key, _file, { progress }) => {
      progress(0.5);
      return { name: 'ok' };
    });

    const { options, setStatusLine } = createOptions(makeResults);

    await new AliOssPublisher(baseConfig).publish(options);

    expect(setStatusLine).toHaveBeenCalledWith(
      `上传中：AMY STATIONS/win32/x64/${version}/RELEASES 50.00%`,
    );
    expect(setStatusLine).toHaveBeenCalledWith(
      `✅ 上传完成：AMY STATIONS/win32/x64/${version}/RELEASES`,
    );
  });

  it('上传失败时抛出带对象 Key 的错误', async () => {
    mocks.multipartUpload
      .mockResolvedValueOnce({ name: 'ok' })
      .mockRejectedValueOnce(new Error('ConnectionTimeoutError'));

    const publisher = new AliOssPublisher(baseConfig);
    const { options } = createOptions(makeResults);

    await expect(publisher.publish(options)).rejects.toThrow(
      `上传失败：AMY STATIONS/win32/x64/${version}/amy_main_process-0.1.23-full.nupkg，cause：ConnectionTimeoutError`,
    );

    // 失败即中断，后续产物不再上传，也不发通知
    expect(mocks.multipartUpload).toHaveBeenCalledTimes(2);
    expect(mocks.notifyPost).not.toHaveBeenCalled();
  });

  it('配置 notifyUrl 时以 AccessKey 为 Bearer 通知发布完成', async () => {
    const publisher = new AliOssPublisher(baseConfig);
    const { options } = createOptions(makeResults);

    await publisher.publish(options);

    expect(mocks.createAuthAxios).toHaveBeenCalledWith(
      'https://release.example.com',
      expect.any(Function),
    );

    const token = mocks.createAuthAxios.mock.calls[0][1]();
    expect(token).toBe('Bearer ' + Buffer.from('ak:sk').toString('base64'));

    const [url, fd] = mocks.notifyPost.mock.calls[0];
    expect(url).toBe('/api/archive/new-version');

    const body = fd.getBuffer().toString();
    expect(body).toContain('AMY STATIONS');
    expect(body).toContain('site.ashenstation.amy');
    expect(body).toContain('win32');
    expect(body).toContain('x64');
    expect(body).toContain(version);
  });

  it('notify 未配置时跳过通知并提示，但仍完成上传', async () => {
    // notify 在类型上是必填的，这里验证运行时兜底分支
    const publisher = new AliOssPublisher({ ...baseConfig, notify: undefined as any });
    const { options, setStatusLine } = createOptions(makeResults);

    await publisher.publish(options);

    expect(mocks.createAuthAxios).not.toHaveBeenCalled();
    expect(mocks.notifyPost).not.toHaveBeenCalled();
    expect(mocks.multipartUpload).toHaveBeenCalledTimes(3);
    expect(setStatusLine).toHaveBeenCalledWith('⚠ 未配置 notifyUrl，跳过发布通知');
  });
});
