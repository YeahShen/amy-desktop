import { type BrowserWindow } from 'electron';

let homeWindow: BrowserWindow | null = null;

export async function createHomeWindow() {
  const dark = await isDark();

  const win = (homeWindow = createFrameWindow({
    width: 1080,
    height: 658,
    minWidth: 1080,
    minHeight: 658,
    resizable: true,
    fullscreenable: true,
    maximizable: true,
    backgroundColor: dark ? '#17181a' : '#fff',
  }));

  win.loadURL(buildWindowUrl('home'));

  win.once('ready-to-show', () => {
    // initTasks(loadTaskList());
    win?.show();
  });

  win.on('close', () => {
    homeWindow = null;
  });

  return homeWindow;
}

export function getHomeWindow() {
  return homeWindow;
}
