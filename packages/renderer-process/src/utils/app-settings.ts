import { appSettingBuilder } from '@amy/shared';
import type { Flatten, AppSettings } from '@amy/shared';

export const { getSetting, setSetting } = appSettingBuilder({
  getter: async function (k: keyof Flatten<AppSettings>) {
    return (await window.electronAPI.getSetting(k)) as any;
  },
  setter: function (k, v) {
    window.electronAPI.setSetting(k, v);
  },
});
