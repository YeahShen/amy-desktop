import type { BrowserWindow } from 'electron';

let loginWindow: BrowserWindow | null = null;

export function createLoginWindow() {
  const win = (loginWindow = createFrameWindow({
    width: 360,
    height: 440,
  }));

  win.loadURL(buildWindowUrl('login'));

  win.once('ready-to-show', () => {
    win?.show();
  });
}

export function getLoginWindow() {
  return loginWindow;
}
