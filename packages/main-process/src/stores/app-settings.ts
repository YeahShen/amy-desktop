import Store, { Schema } from 'electron-store';
import { type AppSettings, appSettingBuilder } from '@amy/shared';

const schema: Schema<AppSettings> = {
  login: {
    type: 'object',
    properties: {
      remenberMe: { type: 'boolean', default: false },
      autoLogin: { type: 'boolean', default: false },
    },
  },
  proxy: {
    type: 'object',
    properties: {
      enabled: { type: 'boolean', default: false },
      url: { type: 'string', default: '' },
    },
  },
  colorMode: { type: 'string', default: 'system' },
  hideHomeWindowOrExit: { type: 'string', default: 'hide' },
  appRunSettings: {
    type: 'object',
    properties: {
      showFloatWindow: { type: 'boolean', default: false },
      enableSendVideoInfoApi: { type: 'boolean', default: false },
    },
  },
  uploadHugeFile: {
    type: 'object',
    properties: {
      sameTimeUploadCount: { type: 'number', default: 5 },
    },
  },
};

const store = new Store<AppSettings>({ name: 'amy-setting', schema });

export const { getSetting, setSetting } = appSettingBuilder({
  getter: async (key) => store.get(key as any),
  setter(key, value) {
    store.set(key as any, value);
  },
});
