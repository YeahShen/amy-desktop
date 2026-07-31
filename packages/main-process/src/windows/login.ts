import type { BrowserWindow } from 'electron';

let loginWindow: BrowserWindow | null = null;

export function createLoginWindow() {
  const win = (loginWindow = createFrameWindow({
    width: 340,
    height: 440,
  }));

  win.loadURL(buildWindowUrl('login'));

  win.webContents.session;

  win.once('ready-to-show', () => {
    win?.show();
  });
}

export function getLoginWindow() {
  return loginWindow;
}
