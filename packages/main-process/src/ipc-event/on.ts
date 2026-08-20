import { ipcMain, BrowserWindow } from 'electron';
import { debouncedStorePositions } from '../windows/float';
import { ON_EVENT } from './channels';
import { User } from '@amy/shared';
import { setAuthenticate } from '../stores/auth';

ipcMain.on(ON_EVENT.OPEN_DEV_TOOLS, (_e) =>
  BrowserWindow.fromWebContents(_e.sender)?.webContents.openDevTools({ mode: 'detach' }),
);

ipcMain.on(ON_EVENT.SET_IGNORE_MOUSE_EVENTS, (_e, ignore: boolean) => {
  const window = BrowserWindow.fromWebContents(_e.sender);
  if (window) {
    window.setIgnoreMouseEvents(ignore, { forward: true });
  }
});

ipcMain.on(ON_EVENT.CLOSE_WINDOW, (_e) => {
  BrowserWindow.fromWebContents(_e.sender)?.close();
});

ipcMain.on(ON_EVENT.MIN_WINDOW, (_e) => {
  BrowserWindow.fromWebContents(_e.sender)?.minimize();
});

ipcMain.on(ON_EVENT.HID_WINDOW, (_e) => {
  BrowserWindow.fromWebContents(_e.sender)?.hide();
});

ipcMain.on(ON_EVENT.LOGIN, async (_e, token: string, user: User) => {
  setAuthenticate(token, user);
  await createHomeWindow();

  BrowserWindow.fromWebContents(_e.sender)?.close();

  if (await getSetting('appRunSettings.showFloatWindow')) {
    createFloatWindow();
  }
});

ipcMain.on(ON_EVENT.MAX_WINDOW, (_e) => {
  BrowserWindow.fromWebContents(_e.sender)?.maximize();
});

ipcMain.on(ON_EVENT.RESTORE_WINDOW, (_e) => {
  BrowserWindow.fromWebContents(_e.sender)?.restore();
});

ipcMain.on(ON_EVENT.SET_USER_INFO, (_e, info) => {
  setUserInfo(info);
});

ipcMain.on(
  ON_EVENT.SET_WINDOW_POSITIONS,
  (_e, position: { x: number; y: number; window: string }) => {
    const _window = BrowserWindow.fromWebContents(_e.sender);
    if (_window) {
      _window.setBounds({
        x: position.x,
        y: position.y,
        width: _window.getBounds().width,
        height: _window.getBounds().height,
      });

      if (position.window === 'float') {
        debouncedStorePositions(position.x, position.y);
      }
    }
  },
);

ipcMain.on(ON_EVENT.SET_SETTING, async (_e, key: any, value: any) => {
  setSetting(key, value);

  if (key === 'colorMode') {
    const home = getHomeWindow();

    const dark = await isDark();

    home?.setBackgroundColor(dark ? '#17181a' : '#fff');
  }
});

ipcMain.on(ON_EVENT.OPEN_FLOAT_WINDOW, createFloatWindow);

ipcMain.on(ON_EVENT.CLOSE_FLOAT_WINDOW, () => {
  const win = getFloatWindow();

  if (win) {
    win.close();
  }
});
