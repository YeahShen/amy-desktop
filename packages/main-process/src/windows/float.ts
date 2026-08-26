import { BrowserWindow, screen } from 'electron';
import path from 'node:path';
import { v4 } from 'uuid';

import { debounce } from 'lodash-es';
import { addBroadcastWindows, removeBroadcastWindows } from '../upload';

let floatWindow: BrowserWindow | null = null;
let id: string;

export function createFloatWindow() {
  if (floatWindow != null) return;

  id = v4();

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const x = getRuntimeConfigItem('floatWindowPosition.x') ?? screenWidth * 0.8;
  const y = getRuntimeConfigItem('floatWindowPosition.y') ?? screenHeight * 0.1 - 100;

  const win = (floatWindow = new BrowserWindow({
    width: 500,
    height: 500,
    // 无边框
    frame: false,
    // 透明背景
    transparent: true,
    // 窗口始终置顶
    alwaysOnTop: true,
    // 不显示在任务栏（根据需求可选）
    skipTaskbar: true,
    x, // 设置窗口的初始位置
    y, // 设置窗口的初始位置
    // 失去焦点时自动隐藏（如不需要可忽略）
    autoHideMenuBar: false,
    webPreferences: {
      contextIsolation: true, // 必须关闭上下文隔离
      nodeIntegration: true, // 启用Node.js集成
      preload: path.join(__dirname, 'preload.js'),
    },
  }));

  win.loadURL(buildWindowUrl('float'));

  win.once('ready-to-show', () => {
    addBroadcastWindows(id, win);
    win?.show();
  });

  win.once('closed', () => {
    removeBroadcastWindows(id);

    win.destroy();
    floatWindow = null;
  });
}

export function getFloatWindow() {
  return floatWindow;
}

export function storePositions(x: number, y: number) {
  setRuntimeConfigItem('floatWindowPosition.x', x);
  setRuntimeConfigItem('floatWindowPosition.y', y);
}

export const debouncedStorePositions = debounce((x: number, y: number) => {
  storePositions(x, y);
}, 500);
