import { Flatten } from '@amy/shared';
import Store, { Schema } from 'electron-store';

export type HomeWindowSize = {
  width: number;
  height: number;
};

export type RuntimeConfig = {
  homeSize: HomeWindowSize;
};

const schema: Schema<RuntimeConfig> = {
  homeSize: {
    type: 'object',
    properties: {
      width: { type: 'number', default: HOME_WINDOW_BASE_SIZE.width },
      height: { type: 'number', default: HOME_WINDOW_BASE_SIZE.heiht },
    },
  },
};

const store = new Store<RuntimeConfig>({ name: 'runtime-config', schema });

export function getRuntimeConfigItem<T extends keyof Flatten<RuntimeConfig>>(
  key: T,
): Flatten<RuntimeConfig>[T] {
  return store.get(key as any) as any;
}

export function setRuntimeConfigItem<T extends keyof Flatten<RuntimeConfig>>(
  key: T,
  value: Flatten<RuntimeConfig>[T],
) {
  store.set(key, value);
}
