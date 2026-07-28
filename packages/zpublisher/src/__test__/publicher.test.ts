import { describe, it, beforeEach } from 'vitest';
import PublisherBitbucket from '../publisher';
import path from 'node:path';
import { PublisherOptions } from '@electron-forge/publisher-base';
import { ForgeMakeResult, ResolvedForgeConfig } from '@electron-forge/shared-types';

const tmpDir = 'C:\\Users\\ayuan\\Desktop\\art';

describe('AmyPublisher', () => {
  let mockMakeResults: ForgeMakeResult[];
  const mockForgeConfig = {} as ResolvedForgeConfig;

  beforeEach(() => {
    mockMakeResults = [
      {
        artifacts: [
          path.join(tmpDir, 'RELEASES'),
          path.join(tmpDir, 'amy_main_process-1.0.0-full.nupkg'),
          path.join(tmpDir, 'AMY STATIONS-1.0.0 Setup.exe'),
        ],
        packageJSON: {
          name: 'test-app',
          version: '1.0.0',
        },
        platform: 'win32',
        arch: 'x64',
      },
    ];
  });

  it(
    'publish',
    async () => {
      const Publisger = new PublisherBitbucket({
        appName: 'amy',
        packageName: 'site.ashenstation.xxx',
        // baseUrl: 'https://xx.ashen-station.top',
        baseUrl: 'http://127.0.0.1:8080/',
        auth: {
          username: 'test',
          password: 'test',
        },
      });

      const options: PublisherOptions = {
        dir: tmpDir,
        makeResults: mockMakeResults,
        forgeConfig: mockForgeConfig,
        setStatusLine: (c) => {
          console.log(c);
        },
      };

      await Publisger.publish(options);
    },
    60 * 10000,
  );
});
