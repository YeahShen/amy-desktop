import type { BaseWindowConstructorOptions } from 'electron';
import path from 'node:path';

import { BrowserWindow } from 'electron';

export const windowArgs: BaseWindowConstructorOptions = {
  frame: false,
  show: false,
  resizable: false,
  fullscreenable: false,
  maximizable: false,
};

export function createFrameWindow(args: BaseWindowConstructorOptions = {}) {
  return new BrowserWindow({
    ...windowArgs,
    ...args,
    webPreferences: {
      contextIsolation: true, // 必须关闭上下文隔离
      nodeIntegration: true, // 启用Node.js集成
      preload: path.join(__dirname, 'preload.js'),
    },
  });
}

export function buildWindowUrl(page: string) {
  return HTML_URL + page;
}

export function loggedIn() {}
