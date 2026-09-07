import type { BrowserWindow } from 'electron';

import { app } from 'electron';

let loginWindow: BrowserWindow | null = null;

export function createLoginWindow() {
  const win = (loginWindow = createFrameWindow({
    width: 370,
    height: 460,
  }));

  win.loadURL(buildWindowUrl('login'));

  win.once('ready-to-show', () => {
    win?.show();
  });

  win.on('closed', () => {
    if (!getToken()) {
      app.quit();
    }
  });
}

export function getLoginWindow() {
  return loginWindow;
}
