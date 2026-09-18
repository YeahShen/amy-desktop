import process from 'node:process';
import { app } from 'electron';
import { checkForUpdate } from './updater';
import { createServer } from './server';
import { isLogin } from './stores/auth';

import './ipc-event';

import { enableCompileCache } from 'node:module';
import { initDB } from './utils/sqlite-db';
import { closeSSEConnect } from './server/sse';
import { isfloatWinHidden } from './windows/float';
import { createNotificationWindow, getNotificationWindow } from './windows/notification';
import { createPlayerWindow } from './windows/video-player';

enableCompileCache();

app.commandLine.appendSwitch('--ignore-certificate-errors-spki-list');
app.commandLine.appendSwitch('--no-proxy-server');
app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('enable-gpu-rasterization');

app.commandLine.appendSwitch('ignore-certificate-errors');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  // 二次启动唤起已有窗口。勿用本实例 process.argv 判断（它是第一个实例的静态 argv，
  // 且 length===1 在 dev 下恒不成立）——需要区分『打开文件启动』时改用事件携带的
  // (event, commandLine, workingDirectory)，此处暂不处理文件参数
  app.on('second-instance', () => {
    const loginWindow = getLoginWindow();
    const home = getHomeWindow();

    if (home) {
      if (home.isMinimized()) home.restore();
      home.show();
      home.focus();
    } else if (loginWindow) {
      if (loginWindow.isMinimized()) loginWindow.restore();
      loginWindow.focus();
    }
  });
}

app.whenReady().then(async () => {
  const squirreling = await handleSquirrelEvent();

  if (squirreling) {
    return;
  }

  if (!gotTheLock) {
    return;
  }

  await initDB();

  await initColorMode();

  createNotificationWindow();

  // if (await createPlayerWindow()) return;

  fullScreen().then((worker) => {
    worker.on('message', (msg) => {
      if (msg.fullScreen) {
        if (!isfloatWinHidden()) {
          getFloatWindow()?.hide();
          getNotificationWindow()?.hide();
        }
      } else {
        if (isfloatWinHidden()) {
          getFloatWindow()?.show();
          getNotificationWindow()?.show();
        }
      }
    });
  });

  createServer();

  if (app.isPackaged) {
    if (await isLogin()) {
      createHomeWindow();
    } else {
      createLoginWindow();
    }

    checkForUpdate();
    return;
  }

  createLoginWindow();
});

app.on('window-all-closed', () => {
  closeSSEConnect();
  app.quit();
});
