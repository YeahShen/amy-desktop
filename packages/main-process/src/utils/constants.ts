import { resolve } from 'node:path';
import { app } from 'electron';

export const RESOURCE_PATH = resolve(app.getAppPath(), '..');

export const HTML_URL = `http://localhost:${PORT}/`;

export const SYSTEM_COLOR_KEY = '--system-color-theme';
export const AMY_COLOR_KEY = '--amy-color-mode';

export const DEFAULT_FONT_TYPE = resolve(RESOURCE_PATH, 'fonts', 'PingFangSC-Medium.ttf');

export const HOME_WINDOW_BASE_SIZE = {
  width: 1080,
  heiht: 658,
};
