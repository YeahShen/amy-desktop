import { resolve } from 'node:path';
import { app } from 'electron';

export const RESOURCE_PATH = resolve(app.getAppPath(), '..');

export const HTML_URL = `http://localhost:${PORT}/`;

export const DEFAULT_FONT_TYPE = resolve(RESOURCE_PATH, 'fonts', 'PingFangSC-Medium.ttf');

export const HOME_WINDOW_BASE_SIZE = {
  width: 1080,
  heiht: 658,
};
