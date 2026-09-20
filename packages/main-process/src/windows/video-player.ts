import type { BrowserWindow } from 'electron';

let playerWindow: BrowserWindow | null = null;

export async function createPlayerWindow(id: string) {
  const win = (playerWindow = createFrameWindow({
    ...HOME_WINDOW_BASE_SIZE,
    resizable: true,
    fullscreenable: true,
    maximizable: true,
    backgroundColor: '#17181a',
  }));

  win.loadURL(buildWindowUrl('videoPlayer?id=' + id));

  win.once('ready-to-show', () => {
    win?.show();
  });

  win.on('close', () => {
    playerWindow = null;
  });

  return true;
}

export function getPlayerWindow() {
  return playerWindow;
}

export function changePlay(id: string) {
  playerWindow?.webContents.send(SEND_EVENT.CHANGE_VIDEO, id);
}
