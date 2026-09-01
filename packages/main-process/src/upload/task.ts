import { fileChunk, TaskScheduler } from '@amy/shared';
import { UploadStatus, UploadTaskOptions } from '@amy/shared/types';

import { authAxios } from '../utils/auth-axios';
import FormData from 'form-data';

type UploadChunkResult = {
  chunkIndex: number;
};

type TaskEvent = {
  progress?: (rate: number) => void;
  record?: () => void;
  error?: (message: string) => void;
  status?: (status: UploadStatus) => void;
  finish?: () => void;
};

export class Task {
  id: string;
  private title: string;
  private filePath: string;
  private size: number;
  private chunkSize: number;
  private createdTime: number;
  private finishTime?: number;
  private _status: UploadStatus;
  private author: number;
  uploadedChunk?: Set<number>;

  private totalChunk: number = 0;
  private progressRate: number = 0;
  private events: TaskEvent = {};

  private finishRetry = 0;
  private readonly MAX_FINISH_RETRY = 3;
  private finishTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduler = new TaskScheduler<UploadChunkResult>({
    sameTimeTask: 10,
    loopInterval: 100,
    retries: 5,
  });

  constructor(options: NonNullable<UploadTaskOptions>) {
    this.id = options.id;
    this.title = options.title;
    this.filePath = options.filePath;
    this.size = options.size;
    this.chunkSize = options.chunkSize;
    this.createdTime = options.createdTime;
    this.finishTime = options.finishTime;
    this._status = options.status;
    this.author = options.author;

    if (Array.isArray(options.uploadedChunk)) {
      this.uploadedChunk = new Set(options.uploadedChunk as number[]);
    } else if (typeof options.uploadedChunk === 'string' && options.uploadedChunk.length > 0) {
      this.uploadedChunk = new Set(options.uploadedChunk.split(',').map((i) => Number(i)));
    } else {
      // 空串/未落库（上传任务首次入库或旧行 uploadedChunk 为 NULL）→ 空 Set
      this.uploadedChunk = new Set();
    }

    this.scheduler.on('successTask', (result) => {
      if (result) {
        this.uploadedChunk?.add(result.chunkIndex);
        this.events['record']?.();
      }
    });

    this.scheduler.on('over', () => this.finish());

    this.scheduler.on('progressRate', () => {
      const rate = Number(((this.uploadedChunk?.size || 0) / this.totalChunk).toFixed(2));
      this.progressRate = rate;
      this.events['progress']?.(rate);
    });
  }

  get status() {
    return this._status;
  }

  set status(s: UploadStatus) {
    this._status = s;

    if (s === 'finish') {
      this.scheduler.destroy();
      this.clearFinishTimer();
      this.events['finish']?.();
    } else if (s === 'pause') {
      this.scheduler.stop();
      this.clearFinishTimer();
    } else if (s === 'delete') {
      this.scheduler.destroy();
      this.clearFinishTimer();
    }

    this.events['progress']?.(this.progressRate);
    this.events['status']?.(s);
  }

  on<K extends keyof TaskEvent>(event: K, fn: NonNullable<TaskEvent[K]>) {
    this.events[event] = fn;
  }

  init() {
    const { id, filePath, chunkSize, uploadedChunk, scheduler } = this;
    let totalChunk, getChunk;

    try {
      const { getChunk: _, totalChunk: __ } = fileChunk(filePath, Number(chunkSize));
      totalChunk = __;
      getChunk = _;
    } catch {
      this.events['error']?.('文件不存在！');
      return;
    }

    this.totalChunk = totalChunk;
    this.progressRate = Number(((uploadedChunk?.size || 0) / totalChunk).toFixed(2));

    for (let i = 1; i <= totalChunk; i++) {
      if (!uploadedChunk?.has(i)) {
        scheduler.addTask(function (resolve, reject) {
          const chunk = getChunk(i);
          const form = new FormData();
          form.append('chunk', chunk);
          form.append('index', i);
          form.append('id', id);

          authAxios
            .post('/api/upload/chunk', form, {
              headers: form.getHeaders(),
            })
            .then(({ data }) => resolve({ ...data, chunkIndex: i }))
            .catch((err) => reject({ err, chunkIndex: i }))
            .finally(() => {
              chunk.close();
            });
        });
      }
    }
  }

  start() {
    this.status = 'uploading';
    this.scheduler.startScheduler();
  }

  pause() {
    this.status = 'pause';
  }

  destroy() {
    this.status = 'delete';
    this.uploadedChunk = undefined;
  }

  error() {
    this.status = 'error';
  }

  private clearFinishTimer() {
    if (this.finishTimer) {
      clearTimeout(this.finishTimer);
      this.finishTimer = null;
    }
  }

  private async finish() {
    if (this.status !== 'uploading') return;

    try {
      const { data } = await authAxios.get<{ loseChunk: number[] }>('/api/upload/check-chunk', {
        params: { id: this.id },
      });

      if (data.loseChunk.length > 0 && this._status === 'uploading') {
        this._status = 'error';
        this.events['error']?.('上传失败！');
        return;
      }

      await authAxios.get('/api/upload/next-step', {
        params: { id: this.id },
      });

      this.status = 'finish';
    } catch (e: any) {
      // next-step 触发后端合并/转码最易抖动，按 1s/2s/3s 退避重试，耗尽后再报 error
      if (this.finishRetry < this.MAX_FINISH_RETRY) {
        this.finishRetry++;
        this.finishTimer = setTimeout(() => {
          this.finishTimer = null;
          this.finish();
        }, 1000 * this.finishRetry);
      } else {
        this.events['error']?.(e?.message || '上传失败，网络错误！');
      }
    }
  }

  getOption(): UploadTaskOptions {
    return {
      id: this.id,
      title: this.title,
      filePath: this.filePath,
      size: this.size,
      chunkSize: this.chunkSize,
      createdTime: this.createdTime,
      finishTime: this.finishTime,
      status: this.status,
      author: this.author,
      uploadedChunk: this.uploadedChunk ? Array.from(this.uploadedChunk) : [],
      progressRate: this.progressRate,
      uploadedSize: this.progressRate * this.size,
    };
  }
}
