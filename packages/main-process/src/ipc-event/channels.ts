export enum ON_EVENT {
  LOGIN = 'login',

  OPEN_DEV_TOOLS = 'open-dev-tools',
  SET_IGNORE_MOUSE_EVENTS = 'set-ignore-mouse-events',
  SET_WINDOW_POSITIONS = 'set-window-position',

  CLOSE_WINDOW = 'close-window',
  HID_WINDOW = 'hid-window',
  MIN_WINDOW = 'min-window',
  MAX_WINDOW = 'max-window',
  RESTORE_WINDOW = 'restore-window',

  SET_SETTING = 'set-setting',
  SET_USER_INFO = 'set-user-info',

  OPEN_FLOAT_WINDOW = 'open-float-window',
  CLOSE_FLOAT_WINDOW = 'close-float-window',
}

export enum HANDLE_EVENT {
  GET_SCREEN_RECT = 'get-screen-rect',
  GET_WINDOW_POSITIONS = 'get-window-position',

  GET_SETTING = 'get-setting',
  OPEN_DIALOG = 'open-dialog',

  GET_USER_DETAIL = 'get-user-detail',
  GET_APP_VERSION = 'get-app-version',
}

export enum SEND_EVENT {
  WINDOW_SIZE_STATE = 'window-size-state',
  AYNC_UPLOAD_ITEM = 'sync-upload-item',
  REPORT_UPLOAD_ERROR = 'report-upload-error',
}

export type OnEventChannels = `${ON_EVENT}`;

export type HandleEventChannels = `${HANDLE_EVENT}`;

export type SendEventChannels = `${SEND_EVENT}`;
