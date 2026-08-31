import { axiosEventSource, AxiosEventSourceLike } from 'axios-eventsource';
import log from 'electron-log';
import { syncTaskStatus } from '../upload';

let stream: AxiosEventSourceLike | undefined = undefined;

type Message = {
  event: string;
  data: any;
};

export function createSSEConnector() {
  stream = axiosEventSource(authAxios, '/api/events/subscribe', {
    onopen: () => {
      log.info('SSE 连接已打开');
    },
    onerror: (event) => {
      log.error('SSE 错误:', event.error);
    },
    // 关闭 authAxios 的 60s 绝对超时：SSE 流无限长，axios fetch adapter 的
    // 超时 timer 只在流结束时才清除，不置 0 会每 60s 强制 abort 一次连接
    // （重连间隙中转码等状态事件会丢失）。
    timeout: 0,
    // 重连策略
    reconnect: {
      initialDelayMs: 1_000,
      maxDelayMs: 30_000,
    },
  });

  stream.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as Message;

      switch (data.event) {
        case 'UPLOAD_STATUS':
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
