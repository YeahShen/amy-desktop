import { axiosEventSource, AxiosEventSourceLike } from 'axios-eventsource';
import log from 'electron-log';
import { syncTaskStatus } from '../upload';

let stream: AxiosEventSourceLike | undefined = undefined;

type Message = {
  type: string;
  data: any;
};

export function createSSEConnector() {
  stream = axiosEventSource(authAxios, 'events', {
    onopen: () => {
      log.info('SSE 连接已打开');
    },
    onerror: (event) => {
      log.info('SSE 错误:', event.error);
    },
    // 重连策略[reference:10]
    reconnect: {
      initialDelayMs: 1_000,
      maxDelayMs: 30_000,
    },
  });

  stream.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as Message;

      switch (data.type) {
        case 'update:status':
          syncTaskStatus(data.data);
      }
    } catch {
      log.info('错误消息:', event.data);
    }
  };
}

export function closeSSEConnect() {
  stream?.close();
  stream = undefined;
}
