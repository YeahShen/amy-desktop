import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { serialHooks } from '@electron/packager';
import { PublisherBitbucket } from '@amy/publisher';

import dotenv from 'dotenv';
import fs from 'node:fs';
import fse from 'fs-extra';
import path from 'node:path';

const model = process.env.NODE_ENV;

dotenv.config({ path: path.resolve(process.cwd(), '..', '..', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '..', '..', `.env.${model}`) });

const appName = process.env.APP_NAME;

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: appName,
    icon: '../assets/icon/favicon',
    afterCopy: [
      serialHooks([
        async (buildPath: string) => {
          const renderer = path.resolve(process.cwd(), '..', 'renderer-process/.output/public');
          const dest = path.resolve(buildPath, '.vite/renderer');
          await fse.copy(renderer, dest);

          const appJSON = JSON.parse(
            fs.readFileSync(path.resolve(buildPath, 'package.json'), { encoding: 'utf-8' }),
          );

          appJSON.productName = appName;
          appJSON.name = appName;
          delete appJSON.scripts;
          delete appJSON.devDependencies;
          delete appJSON.pnpm;
          fs.writeFileSync(path.resolve(buildPath, 'package.json'), JSON.stringify(appJSON), {
            encoding: 'utf-8',
          });
        },
      ]),
    ],
  },
  rebuildConfig: {},
  publishers: [new PublisherBitbucket({})],
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  // publishers: [new PublisherBitbucket({})],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
