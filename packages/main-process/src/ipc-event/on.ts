import { ipcMain, BrowserWindow } from 'electron';

ipcMain.on(ON_EVENT.OPEN_DEV_TOOLS, (_e) =>
  BrowserWindow.fromWebContents(_e.sender)?.webContents.openDevTools({ mode: 'detach' }),
);
