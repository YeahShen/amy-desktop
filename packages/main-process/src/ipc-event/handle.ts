import { app, ipcMain, BrowserWindow, screen, type IpcMainEvent } from 'electron';
import { HANDLE_EVENT } from './channels';
import { Bounding } from '@amy/shared';

import { v4 } from 'uuid';
import { createDialogWindow } from '../windows/dialog';
import { deleteTask, getTasks, pause, startTask } from '../upload';

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

ipcMain.handle(HANDLE_EVENT.GET_USER_DETAIL, async () => {
  return {
    token: getToken(),
    info: await getInfo(),
  };
});

ipcMain.handle(HANDLE_EVENT.GET_APP_VERSION, () => app.getVersion());

ipcMain.handle(
  HANDLE_EVENT.OPEN_DIALOG,
  (
    _e,
    options: { bounding: Bounding; args: Record<string, string>; name: string; onTop: boolean },
  ) => {
    const id = v4();

    const dialog = createDialogWindow(
      options.bounding,
      options.name,
      { ...options.args, dialogId: id },
      options.onTop,
      BrowserWindow.fromWebContents(_e.sender)!,
    );

    return new Promise((resolve) => {
      const onCloseDialog = (_e: IpcMainEvent, result: any) => {
        // 先移除监听器，避免每次弹窗泄漏一个 ipcMain 监听
        ipcMain.off(`close_dialog:${id}`, onCloseDialog);
        dialog.close();
        dialog.destroy();
        resolve(result);
      };

      ipcMain.on(`close_dialog:${id}`, onCloseDialog);

      // 兜底：窗口未走 closeDialog 流程被直接关闭时（加载失败、父窗口关闭等），
      // 同样释放监听器并结束挂起的 Promise，避免 invoke 永久挂起
      dialog.once('closed', () => {
        ipcMain.off(`close_dialog:${id}`, onCloseDialog);
        resolve(undefined);
      });
    });
  },
);

// huge file upload
ipcMain.handle(HANDLE_EVENT.PAUSE_UPLOAD_TASK, (_e, id) => {
  return pause(id);
});

ipcMain.handle(HANDLE_EVENT.DELETE_UPLOAD_TASK, (_e, id) => {
  return deleteTask(id);
});

ipcMain.handle(HANDLE_EVENT.START_UPLOAD_TASK, (_e, id) => {
  return startTask(id);
});

ipcMain.handle(HANDLE_EVENT.GET_UPLOAD_TASKS, (_e, type) => {
  return getTasks(type);
});
