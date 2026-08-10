import { type BrowserWindow, app } from 'electron';

let homeWindow: BrowserWindow | null = null;

export async function createHomeWindow() {
  const dark = await isDark();

  // 仅登录成功（HomeWindow 创建）后才启动系统托盘
  createTray();

  const win = (homeWindow = createFrameWindow({
    width: getRuntimeConfigItem('homeSize.width'),
    height: getRuntimeConfigItem('homeSize.height'),
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

  win.on('close', () => app.quit());

  return homeWindow;
}

export function getHomeWindow() {
  return homeWindow;
}
