import type { ConfigurableAppSettingssKeys } from '@amy/shared-types'

import type {
  HandleEventChannels,
  OnEventChannels,
  SendEventChannels,
} from '../../process-main/app/ipc-event/channels'

export {}

declare global {
  interface Window {
    electronAPI: {
      send(chanel: OnEventChannels, ...arg: any[]): void
      invoke<T = unknown>(chanel: HandleEventChannels, ...arg: any[]): Promise<T>
      on<T = unknown>(chanel: SendEventChannels, func: (...args: T[]) => void): void
      once<T = unknown>(chanel: SendEventChannels, func: (...args: T[]) => void): void

      getSetting<T extends keyof ConfigurableAppSettingssKeys>(
        key: T,
      ): Promise<ConfigurableAppSettingssKeys[T]>

      setSetting<T extends keyof ConfigurableAppSettingssKeys>(key: T, value: any): void

      parseFilePath(filePath: string): ParsedPath & { size: number; chunkSize: string }

      getPathForFile(file?: File): string
    }
  }
}
