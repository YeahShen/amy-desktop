import { type BrowserWindow } from 'electron';

let homeWindow: BrowserWindow | null = null;

export async function createHomeWindow() {
  const dark = await isDark();

  const win = (homeWindow = createFrameWindow({
    width: getRuntimeConfigItem('homeSize.width'),
    height: getRuntimeConfigItem('homeSize.width'),
    minWidth: HOME_WINDOW_BASE_SIZE.width,
    minHeight: HOME_WINDOW_BASE_SIZE.heiht,
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
