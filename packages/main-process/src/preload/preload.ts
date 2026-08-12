import type { IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { HandleEventChannels, OnEventChannels, SendEventChannels } from '../ipc-event/channels';

contextBridge.exposeInMainWorld('electronAPI', {
  send(channel: OnEventChannels, ...args: any[]) {
    ipcRenderer.send(channel, ...args);
  },

  on(channel: SendEventChannels, func: (...args: any[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: any[]) => func(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },

  invoke(channel: HandleEventChannels, ...args: any[]) {
    return ipcRenderer.invoke(channel, ...args);
  },

  getSetting(key: any, dafaultValue: any) {
    return ipcRenderer.invoke('get-setting', key, dafaultValue);
  },

  setSetting(key: any, value: any) {
    ipcRenderer.send('set-setting', key, value);
  },

  getPathForFile: (file: File) => webUtils.getPathForFile(file),

  closeDialog: (id: string, result: any) => {
    ipcRenderer.send(`close_dialog:${id}`, result);
  },

  // parseFilePath: (fPath: string) => {
  //   const size = fs.statSync(fPath).size;
  //   return { ...path.parse(fPath), size, path: fPath, chunkSize: UPLOAD_CHUNK_SIZE };
  // },
});
