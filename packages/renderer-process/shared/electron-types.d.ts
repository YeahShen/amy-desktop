import type { Flatten, AppSettings } from '@amy/shared';

import type {
  HandleEventChannels,
  OnEventChannels,
  SendEventChannels,
} from '../../main-process/src/ipc-event/channels';

export {};

declare global {
  interface Window {
    electronAPI: {
      send(chanel: OnEventChannels, ...arg: any[]): void;
      invoke<T = unknown>(chanel: HandleEventChannels, ...arg: any[]): Promise<T>;
      on<T = unknown>(chanel: SendEventChannels, func: (...args: T[]) => void): void;
      once<T = unknown>(chanel: SendEventChannels, func: (...args: T[]) => void): void;

      getSetting<T extends keyof Flatten<AppSettings>>(key: T): Promise<Flatten<AppSettings>[T]>;

      setSetting<T extends keyof Flatten<AppSettings>>(
        key: T,
        value: Flatten<AppSettings>[T],
      ): void;

      parseFilePath(filePath: string): ParsedPath & { size: number; chunkSize: string };

      getPathForFile(file?: File): string;
    };
  }
}
