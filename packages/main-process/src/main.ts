import process from 'node:process';
import { app } from 'electron';
import { checkForUpdate } from './updater';
import { createServer } from './server';
import { isLogin } from './stores/auth';

import './ipc-event';

import { enableCompileCache } from 'node:module';
import { initDB } from './utils/sqlite-db';

enableCompileCache();

app.commandLine.appendSwitch('--ignore-certificate-errors-spki-list');
app.commandLine.appendSwitch('--no-proxy-server');
app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('enable-gpu-rasterization');

app.commandLine.appendSwitch('ignore-certificate-errors');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const gotTheLock = app.requestSingleInstanceLock();

const actionArgs = process.argv;

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (actionArgs.length === 1) {
      const loginWindow = getLoginWindow();
      const home = getHomeWindow();
      if (home) {
        home?.show();
      } else if (loginWindow) {
        if (loginWindow.isMinimized()) {
          loginWindow.restore();
        }
        loginWindow.focus();
      }
    }
  });
}

app.whenReady().then(async () => {
  const squirreling = await handleSquirrelEvent();

  initDB();

  if (squirreling) {
    return;
  }

  if (!gotTheLock) {
    return;
  }

  await initColorMode();

  fullScreen().then(({ check }) => {
    setInterval(async () => {
      if (await check()) {
        getFloatWindow()?.hide();
      } else {
        getFloatWindow()?.show();
      }
    }, 1000);
  });

  if (app.isPackaged) {
    createServer();

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

app.on('window-all-closed', app.quit);
