import { BrowserWindow, screen } from 'electron';
import path from 'node:path';

let notificationWindow: BrowserWindow | null = null;

export function createNotificationWindow() {
  if (notificationWindow) return;
  const { width: sw, height: sh } = screen.getPrimaryDisplay().bounds;
  const { height: workAreaHeight } = screen.getPrimaryDisplay().workAreaSize;

  const taskbarHeight = sh - workAreaHeight;

  const width = 475;
  const height = sh / 2;

  const win = (notificationWindow = new BrowserWindow({
    width,
    height,
    x: sw - width + 20,
    y: sh - height - taskbarHeight,
    frame: false,
    // 透明背景
    transparent: true,
    // 窗口始终置顶
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: false,
    webPreferences: {
      contextIsolation: true, // 必须关闭上下文隔离
      nodeIntegration: true, // 启用Node.js集成
      preload: path.join(__dirname, 'preload.js'),
    },
  }));

  win.loadURL(buildWindowUrl('notification'));

  win.once('ready-to-show', () => {
    win?.show();
    // win?.webContents.openDevTools({ mode: 'detach' });
  });
}

export function getNotificationWindow() {
  return notificationWindow;
}
