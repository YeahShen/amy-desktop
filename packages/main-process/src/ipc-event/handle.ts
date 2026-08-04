import { ipcMain, BrowserWindow } from 'electron';

ipcMain.handle(HANDLE_EVENT.GET_SCREEN_RECT, () => {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  return {
    primary: { width, height },
  };
});

ipcMain.handle(HANDLE_EVENT.GET_WINDOW_POSITIONS, (_e) => {
  const window = BrowserWindow.fromWebContents(_e.sender);
  return window?.getBounds();
});
