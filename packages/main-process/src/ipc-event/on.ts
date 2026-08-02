import { ipcMain, BrowserWindow } from 'electron';

ipcMain.on(ON_EVENT.OPEN_DEV_TOOLS, (_e) =>
  BrowserWindow.fromWebContents(_e.sender)?.webContents.openDevTools({ mode: 'detach' }),
);

ipcMain.on(ON_EVENT.SET_IGNORE_MOUSE_EVENTS, (_e, ignore: boolean) => {
  const window = BrowserWindow.fromWebContents(_e.sender);
  if (window) {
    window.setIgnoreMouseEvents(ignore, { forward: true });
  }
});

ipcMain.on(ON_EVENT.GET_WINDOW_POSITIONS, (_e) => {
  const window = BrowserWindow.fromWebContents(_e.sender);
  return window?.getPosition();
});
