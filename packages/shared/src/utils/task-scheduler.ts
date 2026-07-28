import { createTrackedPromise, TrackedPromise, TrackedPromiseExecutor } from './track-promise';

type ScheduleTask<T> = () => TrackedPromise<T>;

interface TaskSchedulerOptions {
  sameTimeTask: number; // 默认 5
  loopInterval?: number;
  retries?: number; // 默认 undefined（不重试）
  single?: boolean;
}

type SchedulerStatus = 'stop' | 'executing' | 'idle';

type ScheduleEvent<T> = {
  over?: () => any;
  failTask?: (reason: any) => void;
  successTask?: (result: T | null) => void;
  progressRate?: (rate: number) => void;
};

class TaskScheduler<T> {
  private sameTimeTask: number;
  private tasks: ScheduleTask<T>[] = [];

  private executing: TrackedPromise<T>[] = [];
  private retries?: number;
  private loopInterval: number;
  private timer: any;
  private single = true;
  private counter = new Map<string, number>();

  private totalTaskNum = 0;

  private event: ScheduleEvent<T> = {};

  private _status: SchedulerStatus = 'idle';

  constructor(options: TaskSchedulerOptions) {
    if (
      options.sameTimeTask <= 0 ||
      !Number.isFinite(options.sameTimeTask) ||
      !Number.isInteger(options.sameTimeTask)
    ) {
      throw new Error('sameTimeTask must be a positive integer');
    }

    if (
      options.loopInterval !== undefined &&
      (options.loopInterval <= 0 ||
        !Number.isFinite(options.loopInterval) ||
        !Number.isInteger(options.loopInterval))
    ) {
      throw new Error('loopInterval must be a positive integer');
    }

    this.sameTimeTask = options.sameTimeTask;
    this.retries = options.retries;

    this.loopInterval = options?.loopInterval ?? 100;

    if (typeof options.single !== 'undefined') {
      this.single = options.single;
    }
  }

  get status() {
    return this._status;
  }

  set status(v) {
    this._status = v;

    if (v === 'idle') {
      if (this.single) {
        clearInterval(this.timer);
      }
    } else if (v === 'stop') {
      clearInterval(this.timer);
    }
  }

  on<K extends keyof ScheduleEvent<T>>(event: K, fn: NonNullable<ScheduleEvent<T>[K]>) {
    this.event[event] = fn;
  }

  addTask(task: TrackedPromiseExecutor<T>) {
    this.totalTaskNum = this.totalTaskNum + 1;
    this.tasks.push(() => createTrackedPromise(task));
  }

  startScheduler() {
    if (this.status === 'executing') return;

    this.status = 'executing';

    this.timer = setInterval(() => {
      if (this.tasks.length === 0 && this.executing.length === 0 && this._status === 'executing') {
        this.event['over']?.();
        this.status = 'idle';
      }

      const rejectedTask = this.executing.filter((t) => t.getStatus() === 'rejected');
      const fulfilledTask = this.executing.filter((t) => t.getStatus() === 'fulfilled');
      this.executing = this.executing.filter((t) => t.getStatus() === 'pending');

      this.processRejectedTask(rejectedTask);
      this.processFulfilledTask(fulfilledTask);

      for (let i = 0; i < this.sameTimeTask - this.executing.length; i++) {
        if (this.tasks.length) {
          const task = this.tasks.shift();

          if (task) {
            const taskEntity = task();

            if (!this.counter.has(taskEntity.getUid())) {
              this.counter.set(taskEntity.getUid(), 0);
            }

            this.executing.push(taskEntity);
          }
        }
      }

      const rate =
        this.totalTaskNum > 0
          ? (this.totalTaskNum - (this.tasks.length + this.executing.length)) / this.totalTaskNum
          : 0;

      this.event['progressRate']?.(rate);
    }, this.loopInterval);
  }

  private processRejectedTask(task: TrackedPromise<T>[]) {
    task.forEach((t) => {
      const id = t.getUid();
      const executor = t.getExecutor();

      const counter = this.counter.get(id) || 0;

      if (counter >= (this.retries || 0)) {
        this.event['failTask']?.(t.getReason());
        this.counter.delete(id);
      } else {
        this.tasks.push(() => createTrackedPromise(executor));
        this.counter.set(id, counter + 1);
      }
    });
  }

  private processFulfilledTask(task: TrackedPromise<T>[]) {
    task.forEach((t) => {
      this.counter.delete(t.getUid());
      this.event['successTask']?.(t.getValue());
    });
  }

  stop() {
    this.status = 'stop';
  }

  destroy() {
    clearInterval(this.timer);
    this.timer = null;
    this._status = 'stop';
    this.tasks = [];
    this.executing = [];
    this.counter.clear();
    this.event = {};
  }
}

export { TaskScheduler };
