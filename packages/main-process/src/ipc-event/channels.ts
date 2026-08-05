export enum ON_EVENT {
  OPEN_DEV_TOOLS = 'open-dev-tools',
  SET_IGNORE_MOUSE_EVENTS = 'set-ignore-mouse-events',
  GET_WINDOW_POSITIONS = 'get-window-position',
  SET_WINDOW_POSITIONS = 'set-window-position',

  CLOSE_WINDOW = 'close-window',
  MIN_WINDOW = 'min-window',
}

export enum HANDLE_EVENT {
  GET_SCREEN_RECT = 'get-screen-rect',
  GET_WINDOW_POSITIONS = 'get-window-position',
}

export enum SEND_EVENT {}

export type OnEventChannels = `${ON_EVENT}`;

export type HandleEventChannels = `${HANDLE_EVENT}`;

export type SendEventChannels = `${SEND_EVENT}`;
