import { describe, it, beforeEach } from 'vitest';
import PublisherBitbucket from '../publisher';
import path from 'node:path';
import { PublisherOptions } from '@electron-forge/publisher-base';
import { ForgeMakeResult, ResolvedForgeConfig } from '@electron-forge/shared-types';

const tmpDir = 'D:\\AMY_PRO\\amy-desktop\\packages\\main-process\\out\\make\\squirrel.windows\\x64';

describe('AmyPublisher', () => {
  let mockMakeResults: ForgeMakeResult[];
  const mockForgeConfig = {} as ResolvedForgeConfig;

  beforeEach(() => {
    mockMakeResults = [
      {
        artifacts: [
          path.join(tmpDir, 'RELEASES'),
          path.join(tmpDir, 'amy_main_process-0.0.1-full.nupkg'),
          path.join(tmpDir, 'AMY STATIONS-0.0.1 Setup.exe'),
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
        appName: 'xxx',
        packageName: 'site.ashenstation.xxx',
        baseUrl: 'https://release.ashen-station.top',
        auth: {
          username: 'ashen',
          password: 'Lyuanshen520.',
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
