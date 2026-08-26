import { UploadTaskOptions, UploadStatus } from '@amy/shared/types';
import { fileChunk, TaskScheduler } from '@amy/shared';
import { authAxios } from '../utils/auth-axios';
import FormData from 'form-data';
import { ReadStream } from 'fs';

type UploadChunkResult = {
  chunkIndex: number;
};

type TaskEvent = {
  progress?: (task: UploadTaskOptions, rate: number) => void;
  record?: (task: UploadTaskOptions) => void;
  error?: (task: UploadTaskOptions, message: string) => void;
  status?: (id: string, status: UploadStatus) => void;
};

export class Task {
  private option: UploadTaskOptions;
  private _status: UploadStatus;
  private uploadedChunk: Set<number>;
  private totalChunk: number;

  private finishRetry = 0;
  private readonly MAX_FINISH_RETRY = 3;
  private finishTimer: ReturnType<typeof setTimeout> | null = null;

  private getChunkFn: (index: number) => ReadStream;
  private events: TaskEvent = {};

  private scheduler = new TaskScheduler<UploadChunkResult>({
    sameTimeTask: 1,
    loopInterval: 100,
    retries: 5,
  });

  constructor(options: NonNullable<UploadTaskOptions>) {
    this.option = options;
    this._status = options.status;

    if (Array.isArray(options.uploadedChunk)) {
      this.uploadedChunk = new Set(options.uploadedChunk as number[]);
    } else {
      this.uploadedChunk = new Set(options.uploadedChunk.split(',').map((i) => Number(i)));
    }

    const { getChunk, totalChunk } = fileChunk(options.filePath, Number(FILE_UPLOAD_CHUNK_SIZE));
    this.getChunkFn = getChunk;
    this.totalChunk = totalChunk;

    for (let i = 1; i <= totalChunk; i++) {
      if (!this.uploadedChunk.has(i)) this.addTask(i);
    }

    this.scheduler.on('successTask', (result) => {
      if (result) {
        this.uploadedChunk.add(result.chunkIndex);
        this.events['record']?.({
          ...this.option,
          uploadedChunk: [...this.uploadedChunk],
          status: this._status,
        });
      }
    });

    this.scheduler.on('over', () => this.uploadFinish());

    this.scheduler.on('progressRate', () => {
      const rate = this.uploadedChunk.size / this.totalChunk;

      this.events['progress']?.(
        { ...this.option, status: this._status, uploadedChunk: [...this.uploadedChunk] },
        rate,
      );
    });
  }

  on<K extends keyof TaskEvent>(event: K, fn: NonNullable<TaskEvent[K]>) {
    this.events[event] = fn;
  }

  get id() {
    return this.option.id;
  }

  get status() {
    return this._status;
  }

  set status(value: UploadStatus) {
    this._status = value;

    if (value === 'pause') {
      this.scheduler.stop();
      this.clearFinishTimer();
    } else if (value === 'finish') {
      this.scheduler.destroy();
      this.clearFinishTimer();
    }

    this.events['status']?.(this.id, value);
  }

  pause() {
    this.status = 'pause';
  }

  destroy() {
    this.status = 'pause';
    this.scheduler.destroy();
  }

  private clearFinishTimer() {
    if (this.finishTimer) {
      clearTimeout(this.finishTimer);
      this.finishTimer = null;
    }
  }

  private addTask(index: number) {
    const _this = this;

    this.scheduler.addTask(function (r1, r2) {
      const chunk = _this.getChunkFn(index);

      const form = new FormData();
      form.append('chunk', chunk);
      form.append('index', index);
      form.append('id', _this.option.id);

      authAxios
        .post('/api/upload/chunk', form, {
          headers: {
            ...form.getHeaders(),
          },
        })
        .then(({ data }) => r1({ ...data, chunkIndex: index }))
        .catch((err) => r2({ err: err }))
        .finally(() => {
          chunk.close();
        });
    });
  }

  start() {
    this.status = 'uploading';
    this.scheduler.startScheduler();
  }

  private async uploadFinish() {
    if (this._status !== 'uploading') return;

    try {
      const { data } = await authAxios.get<{ loseChunk: number[] }>('/api/upload/check-chunk', {
        params: { id: this.option.id },
      });

      if (data.loseChunk.length > 0 && this._status === 'uploading') {
        this._status = 'error';
        this.events['error']?.(this.getOption(), '上传失败！');
        return;
      }

      await authAxios.get('/api/upload/next-step', {
        params: { id: this.option.id },
      });
    } catch (e: any) {
      if (this.finishRetry < this.MAX_FINISH_RETRY) {
        this.finishRetry++;
        this.finishTimer = setTimeout(() => {
          this.finishTimer = null;
          this.uploadFinish();
        }, 1000 * this.finishRetry);
      } else {
        // 重试耗尽：上报失败状态，等待上层介入
        this.events['error']?.(
          { ...this.option, status: this._status, uploadedChunk: [...this.uploadedChunk] },
          e.message,
        );
      }
    }
  }

  /**
   * 请求 next-step 是调用后端异步执行的方法，包括合并文件和文件转码，通过 syncMessage 方法同步任务进度
   * @param status
   * @param progress
   */
  syncMessage(status: UploadStatus, progress: number) {
    this.status = status;

    this.events['progress']?.(
      { ...this.option, status: this._status, uploadedChunk: [...this.uploadedChunk] },
      progress,
    );
  }

  getOption() {
    return { ...this.option, status: this._status, uploadedChunk: [...this.uploadedChunk] };
  }
}
