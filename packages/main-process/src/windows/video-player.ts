import type { BrowserWindow } from 'electron';

let playerWindow: BrowserWindow | null = null;

export function createPlayerWindow() {
  const win = (playerWindow = createFrameWindow({
    ...HOME_WINDOW_BASE_SIZE,
    resizable: true,
    fullscreenable: true,
    maximizable: true,
    backgroundColor: '#17181a',
  }));

  win.loadURL(buildWindowUrl('videoPlayer'));

  win.once('ready-to-show', () => {
    win?.show();
  });

  return true;
}

export function getPlayerWindow() {
  return playerWindow;
}
