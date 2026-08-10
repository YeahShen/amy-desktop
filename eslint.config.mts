import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

import withNuxt from './packages/renderer-process/.nuxt/eslint.config.mjs';

export default (async function () {
  const nuxtConfig = await withNuxt();

  const rendererProcessConfig = nuxtConfig.map((config) => {
    let files;
    if (typeof config.files === 'undefined') {
      files = ['packages/renderer/src/*{ts,tsx,vue}'];
    }

    if (typeof config.files === 'object') {
      files = config.files.map((filePath) => {
        const path = filePath as string;
        return 'pachages/renderer-process/' + path;
      });
    }

    return {
      ...config,
      files,
    };
  });

  async function getMainProcessAutoImportConfig() {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const configPath = resolve(__dirname, 'packages/main-process/.eslintrc-auto-import.json');
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content);
  }

  return defineConfig([
    // 全局忽略：根目录及所有子项目的 node_modules
    {
      ignores: [
        '**/node_modules/**',
        '**/.nuxt/**',
        '**/dist/**',
        '**/.output/**',
        '**/.vite/**',
        '.vscode/**',
        '**/tsconfig.json',
      ],
    },

    {
      files: ['**/*.json'],
      plugins: { json },
      language: 'json/json',
      extends: ['json/recommended'],
    },

    {
      files: ['packages/main-process/src/**/*.ts', 'packages/zpublisher/src/**/*.ts'],
      languageOptions: { globals: { ...globals.node } },
      extends: [tseslint.configs.recommended],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },

    {
      files: ['packages/main-process/src/**/*.ts'],
      languageOptions: {
        globals: (await getMainProcessAutoImportConfig()).globals,
      },
    },

    ...rendererProcessConfig,
    eslintConfigPrettier,
  ]);
})();
