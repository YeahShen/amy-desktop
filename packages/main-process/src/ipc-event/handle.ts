import { ipcMain, BrowserWindow, screen } from 'electron';
import { HANDLE_EVENT } from './channels';

ipcMain.handle(HANDLE_EVENT.GET_SCREEN_RECT, () => {
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

ipcMain.handle(HANDLE_EVENT.GET_SETTING, (_e, key) => {
  return getSetting(key);
});
