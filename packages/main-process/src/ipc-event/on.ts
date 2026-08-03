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

ipcMain.on(ON_EVENT.SET_WINDOW_POSITIONS, (_e, position: { x: number; y: number }) => {
  const window = BrowserWindow.fromWebContents(_e.sender);
  if (window) {
    window.setBounds({
      x: position.x,
      y: position.y,
      width: window.getBounds().width,
      height: window.getBounds().height,
    });
  }
});
