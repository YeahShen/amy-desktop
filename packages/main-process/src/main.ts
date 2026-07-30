import { app, BrowserWindow, screen } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { checkForUpdate } from './updater';
import { checkFullScreen } from './utils/check-full-screen';

import log from 'electron-log';

app.commandLine.appendSwitch('--ignore-certificate-errors-spki-list');
app.commandLine.appendSwitch('--no-proxy-server');
app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('enable-gpu-rasterization');

app.commandLine.appendSwitch('ignore-certificate-errors');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

checkForUpdate();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL('https://www.baidu.com/');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', async () => {
  // const { isAnyAppFullScreen } = await checkFullScreen();
  createWindow();

  checkFullScreen()
    .then(({ isAnyAppFullScreen }) => {
      log.info('fff', isAnyAppFullScreen());
      console.log(isAnyAppFullScreen());
    })
    .catch((err) => {
      console.log(err);
      log.info('ee', err);
    });

  // setInterval(() => {
  //   log.info('fff', isAnyAppFullScreen());
  // }, 1000);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
