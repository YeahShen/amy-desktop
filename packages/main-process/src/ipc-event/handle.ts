import { ipcMain, BrowserWindow } from 'electron';

ipcMain.handle(HANDLE_EVENT.GET_WINDOW_POSITIONS, (_e) => {
  const window = BrowserWindow.fromWebContents(_e.sender);
  return window?.getBounds();
});
