import { app, Menu, nativeImage, Tray } from 'electron';
import path from 'node:path';

let tray: Tray | null = null;
let isQuitting = false;

/**
 * 获取托盘图标
 * - Windows: 使用 .ico（多尺寸，缩放清晰）
 * - Linux: 使用 PNG（24x24，StatusNotifier/AppIndicator 标准尺寸）
 * - 开发模式从 shared 源码资源加载，打包后从 resources 目录加载（见 forge.config.ts extraResource）
 */
function getTrayIcon() {
  const iconDir = app.isPackaged
    ? path.join(process.resourcesPath, 'icon')
    : path.resolve(process.cwd(), '../shared/src/assets/icon');

  const iconFile = process.platform === 'win32' ? 'favicon.ico' : '24x24.png';

  return nativeImage.createFromPath(path.join(iconDir, iconFile));
}

/** 显示主窗口（无主窗口时回退到登录窗口） */
function showMainWindow() {
  const home = getHomeWindow();
  if (home) {
    if (home.isMinimized()) {
      home.restore();
    }
    home.show();
    home.focus();
    return;
  }

  const loginWindow = getLoginWindow();
  if (loginWindow) {
    if (loginWindow.isMinimized()) {
      loginWindow.restore();
    }
    loginWindow.show();
    loginWindow.focus();
  }
}

/** 切换主窗口显示/隐藏 */
function toggleMainWindow() {
  const home = getHomeWindow();
  if (home?.isVisible()) {
    home.hide();
    return;
  }
  showMainWindow();
}

/** 应用是否正在退出（用于窗口 close 事件判断是否放行） */
export function isAppQuitting() {
  return isQuitting;
}

/** 从托盘退出应用 */
export function quitApp() {
  isQuitting = true;
  app.quit();
}

/** 创建系统托盘 */
export function createTray() {
  if (tray) {
    return tray;
  }

  tray = new Tray(getTrayIcon());
  tray.setToolTip(APP_NAME);

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: showMainWindow },
    { type: 'separator' },
    { label: '退出', click: quitApp },
  ]);
  tray.setContextMenu(contextMenu);

  // Windows: 左键单击切换主窗口显隐
  // Linux: AppIndicator 不支持 click 事件，依赖右键菜单操作
  if (process.platform === 'win32') {
    tray.on('click', toggleMainWindow);
  }

  return tray;
}
