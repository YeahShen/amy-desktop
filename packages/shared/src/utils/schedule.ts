import { TrackedPromise } from './track-promise';

interface ScheduleOptions<T> {
  sameTimeTask: number;
  taskList: ScheduleTask<T>[];
}

type ScheduleStatus = 'stop' | 'running' | 'idle' | 'over';

type ScheduleTask<T> = (...args: any) => TrackedPromise<T>;

type ScheduleEvent<T> = {
  over?: () => any;
  failTask?: (scheduleTask: TrackedPromise<T>) => any;
};

class Schedule<T> {
  private sameTimeTask: number = 5;
  private taskList: ScheduleTask<T>[] = [];
  private runningTasks: TrackedPromise<T>[] = [];

  private timer: any;
  private _status: ScheduleStatus = 'idle';
  private event: ScheduleEvent<T> = {};

  constructor(options: ScheduleOptions<T>) {
    this.sameTimeTask = options.sameTimeTask;
    this.taskList = options.taskList;
  }

  set status(v: ScheduleStatus) {
    this._status = v;

    if (this._status === 'stop' || this._status === 'idle' || this._status === 'over') {
      clearInterval(this.timer);
    }

    if (v === 'over') {
      this.event['over']?.();
    }
  }

  pushTask(task: ScheduleTask<T>) {
    this.taskList.push(task);
  }

  startSchedule() {
    this.timer = setInterval(() => {
      this.runningTasks.forEach((task) => {
        if (task.getStatus() === 'rejected') {
          this.event['failTask']?.(task);
        }
      });

      this.runningTasks = this.runningTasks.filter((t) => t.getStatus() === 'pending');

      for (let i = 0; i < this.sameTimeTask - this.runningTasks.length; i++) {
        if (this.taskList.length) {
          const t = this.taskList.shift();

          if (t) {
            this.runningTasks.push(t());
          }
        }
      }

      if (this.runningTasks.length === 0 && this.taskList.length === 0) this.status = 'over';
    }, 500);
  }

  stopSechedule(_: ScheduleStatus) {
    this.status = _;
  }

  on<K extends keyof ScheduleEvent<T>>(event: K, fn: NonNullable<ScheduleEvent<T>[K]>) {
    this.event[event] = fn;
  }
}

export { Schedule };
