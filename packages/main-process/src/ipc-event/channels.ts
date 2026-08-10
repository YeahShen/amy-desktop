export enum ON_EVENT {
  LOGIN = 'login',

  OPEN_DEV_TOOLS = 'open-dev-tools',
  SET_IGNORE_MOUSE_EVENTS = 'set-ignore-mouse-events',
  GET_WINDOW_POSITIONS = 'get-window-position',
  SET_WINDOW_POSITIONS = 'set-window-position',

  CLOSE_WINDOW = 'close-window',
  HID_WINDOW = 'hid-window',
  MIN_WINDOW = 'min-window',

  SET_SETTING = 'set-setting',
}

export enum HANDLE_EVENT {
  GET_SCREEN_RECT = 'get-screen-rect',
  GET_WINDOW_POSITIONS = 'get-window-position',

  GET_SETTING = 'get-setting',
}

export enum SEND_EVENT {}

export type OnEventChannels = `${ON_EVENT}`;

export type HandleEventChannels = `${HANDLE_EVENT}`;

export type SendEventChannels = `${SEND_EVENT}`;
