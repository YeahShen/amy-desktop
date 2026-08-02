import { BrowserWindow } from 'electron';
import path from 'node:path';

let floatWindow: BrowserWindow | null = null;

export function createFloatWindow() {
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
    // 失去焦点时自动隐藏（如不需要可忽略）
    // autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true, // 必须关闭上下文隔离
      nodeIntegration: true, // 启用Node.js集成
      preload: path.join(__dirname, 'preload.js'),
    },
  }));

  win.loadURL(buildWindowUrl('float'));

  win.webContents.session;

  win.once('ready-to-show', () => {
    win?.show();
  });
}

export function getFloatWindow() {
  return floatWindow;
}
