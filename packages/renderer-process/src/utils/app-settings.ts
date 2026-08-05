import { appSettingBuilder } from '@amy/shared';
import type { Flatten, AppSettings } from '@amy/shared';

export const { getSetting, setSetting } = appSettingBuilder({
  getter: async function (k: keyof Flatten<AppSettings>) {
    if (import.meta.client) return (await window.electronAPI?.getSetting(k)) as any;
  },
  setter: function (k, v) {
    if (import.meta.client) window.electronAPI?.setSetting(k, v);
  },
});
