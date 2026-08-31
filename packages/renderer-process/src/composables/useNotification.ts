import type { NotificationInstance } from 'antdv-next/dist/notification/interface';

export function useNotification() {
  function open(type: Exclude<keyof NotificationInstance, 'destroy'>, message: string) {
    window.electronAPI.send('notify-message', type, message);
  }

  return {
    info(m: string) {
      open('info', m);
    },
    success(m: string) {
      open('success', m);
    },
    error(m: string) {
      open('error', m);
    },
    warning(m: string) {
      open('warning', m);
    },
  };
}
