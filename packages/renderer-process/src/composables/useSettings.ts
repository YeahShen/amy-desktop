import type { AppSettings, Flatten } from '@amy/shared';

export function useSettings<T extends keyof Flatten<AppSettings>>(key: T) {
  const vv = ref<Flatten<AppSettings>[T]>();

  if (import.meta.client) {
    window.electronAPI.getSetting(key).then((v) => {
      vv.value = v;
    });

    watch(vv, (v) => {
      if (typeof v !== 'undefined') {
        window.electronAPI.setSetting(key, v);
      }
    });
  }

  return vv;
}
