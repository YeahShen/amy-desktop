import Store from 'electron-store';
import { type AppSettings, appSettingBuilder } from '@amy/shared';

const store = new Store<AppSettings>({ name: 'amy-setting' });

const defaultSettings: AppSettings = {
  login: {
    remenberMe: false,
    autoLogin: false,
  },
  proxy: {
    enabled: false,
    url: '',
  },
  colorMode: 'system',
  hideHomeWindowOrExit: 'hide',
  appRunSettings: {
    showFloatWindow: true,
  },
};

function getDefaultValue(key: string): unknown {
  return key.split('.').reduce((obj: any, part) => obj?.[part], defaultSettings);
}

export const { getSetting, setSetting } = appSettingBuilder({
  getter: async (key) => {
    const value = store.get(key as any);
    return value !== undefined ? value : (getDefaultValue(key as string) as any);
  },
  setter(key, value) {
    store.set(key as any, value);
  },
});
