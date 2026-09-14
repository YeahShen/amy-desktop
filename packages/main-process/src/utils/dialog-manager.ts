import { BrowserWindow } from 'electron';

const dialogs: Record<string, { instance: BrowserWindow; name: string }> = {};

export function setDialog(id: string, dialog: BrowserWindow, name: string) {
  dialogs[id] = {
    instance: dialog,
    name,
  };

  return id;
}

export function removeDialog(id: string) {
  delete dialogs[id];
}

export function getAllDialog() {
  return Object.values(dialogs);
}
