import { Flatten } from './tools';

export type LoginConfig = {
  autoLogin: boolean;
  remenberMe: boolean;
};

export type UseProxy = {
  enabled: boolean;
  url: string;
};

export interface UploadSettings {
  sameTimeMaxUploadCount: number;
}

export type ColorMode = 'dark' | 'light' | 'system';
export type HideHomeWindowOrExit = 'hide' | 'exit';

export type AppRunSettings = {
  showFloatWindow: boolean;
};

export type AppSettings = {
  login: LoginConfig;
  proxy: UseProxy;
  colorMode: ColorMode;
  hideHomeWindowOrExit: HideHomeWindowOrExit;
  appRunSettings: AppRunSettings;
  uploadHugeFile: {
    sameTimeUploadCount: number;
  };
};

type AppSettingGetter = <T extends keyof Flatten<AppSettings>>(
  key: T,
) => Promise<Flatten<AppSettings>[T]>;
type AppSettingSetter = <T extends keyof Flatten<AppSettings>>(
  key: T,
  value: Flatten<AppSettings>[T],
) => void;

export function appSettingBuilder({
  getter,
  setter,
}: {
  getter: AppSettingGetter;
  setter: AppSettingSetter;
}) {
  return {
    getSetting: getter,
    setSetting: setter,
  };
}
