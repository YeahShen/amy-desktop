import { type ConfigEnv, defineConfig, loadEnv, PluginOption } from 'vite';
import process from 'node:process';
import path from 'node:path';

import fs from 'node:fs';

import AutoImport from 'unplugin-auto-import/vite';

export default ({ mode }: ConfigEnv) => {
  const props = loadEnv(mode, path.resolve(process.cwd(), '..', '..'), 'AMY_');

  const define = Object.fromEntries(
    Object.entries(props).map(([key, value]) => [[key.replace('AMY_', '')], JSON.stringify(value)]),
  );
  return defineConfig({
    define,
    plugins: [
      AutoImport({
        packagePresets: [],
        dirs: ['./src/utils', './src/windows', './src/stores', './src/ipc-event'],
        dts: 'types/main-process-autoimport.d.ts',
        imports: [],
        eslintrc: {
          enabled: true, // Default `false`
          filepath: '.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
          globalsPropValue: 'readonly',
        },
      }) as PluginOption,
      {
        name: 'setCusDts',
        options() {
          const keys = Object.keys(define);

          const dstr = keys.reduce((pre, cur) => {
            return pre + '  const ' + cur + ': string' + '\n';
          }, '\n');

          const dtsStr = `export {}\ndeclare global {${dstr}}`;

          fs.writeFileSync('./types/define.d.ts', dtsStr);
        },
      },
    ],
  });
};
