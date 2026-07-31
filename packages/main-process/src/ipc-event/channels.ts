export enum ON_EVENT {
  OPEN_DEV_TOOLS = 'open-dev-tools',
}

export enum HANDLE_EVENT {}

export enum SEND_EVENT {}

export type OnEventChannels = `${ON_EVENT}`;

export type HandleEventChannels = `${HANDLE_EVENT}`;

export type SendEventChannels = `${SEND_EVENT}`;
