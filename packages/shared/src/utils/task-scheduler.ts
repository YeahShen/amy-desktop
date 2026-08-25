import { createTrackedPromise, TrackedPromise, TrackedPromiseExecutor } from './track-promise';

/** 调度任务工厂函数：调用后返回一个 TrackedPromise 实例 */
type ScheduleTask<T> = () => TrackedPromise<T>;

interface TaskSchedulerOptions {
  /** 最大并发任务数（必须为正整数） */
  sameTimeTask: number; // 默认 5
  /** 调度轮询间隔（ms），默认 100 */
  loopInterval?: number;
  /** 单个任务最大重试次数，默认 undefined（不重试） */
  retries?: number; // 默认 undefined（不重试）
  /** 是否单次模式：true 时所有任务完成后调度器自动停止（清除定时器），默认 true */
  single?: boolean;
}

type SchedulerStatus = 'stop' | 'executing' | 'idle';

/** 调度器事件回调集合 */
type ScheduleEvent<T> = {
  /** 所有任务执行完毕（排队 + 执行中均为空） */
  over?: () => any;
  /** 单个任务重试耗尽后最终失败 */
  failTask?: (reason: any) => void;
  /** 单个任务成功完成 */
  successTask?: (result: T | null) => void;
  /** 整体进度变化（0 ~ 1） */
  progressRate?: (rate: number) => void;
};

/**
 * 并发任务调度器
 *
 * 通过 setInterval 轮询驱动，维护一个待执行队列和一个执行中队列，
 * 按 sameTimeTask 控制并发上限，支持失败重试、进度广播、生命周期事件。
 */
class TaskScheduler<T> {
  /** 最大并发数 */
  private sameTimeTask: number;
  /** 待执行任务队列（工厂函数数组，尚未调用） */
  private tasks: ScheduleTask<T>[] = [];

  /** 正在执行中的 TrackedPromise 列表 */
  private executing: TrackedPromise<T>[] = [];
  /** 单个任务最大重试次数 */
  private retries?: number;
  /** 调度轮询间隔（ms） */
  private loopInterval: number;
  /** setInterval 定时器引用 */
  private timer: any;
  /** 单次模式：完成后自动清除定时器 */
  private single = true;
  /** 任务重试计数器（uid → 已重试次数） */
  private counter = new Map<string, number>();

  /** 累计添加的任务总数（含重试重新入队的），用于计算进度 */
  private totalTaskNum = 0;

  /** 事件回调存储 */
  private event: ScheduleEvent<T> = {};

  /** 调度器当前状态 */
  private _status: SchedulerStatus = 'idle';

  constructor(options: TaskSchedulerOptions) {
    // 校验 sameTimeTask 必须为正整数
    if (
      options.sameTimeTask <= 0 ||
      !Number.isFinite(options.sameTimeTask) ||
      !Number.isInteger(options.sameTimeTask)
    ) {
      throw new Error('sameTimeTask must be a positive integer');
    }

    // 校验 loopInterval（可选）必须为正整数
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

  /**
   * 状态 setter：切换状态时自动管理定时器生命周期
   * - idle（单次模式）/ stop：清除定时器
   */
  set status(v) {
    this._status = v;

    if (v === 'idle') {
      // 单次模式下任务全部完成，停止轮询
      if (this.single) {
        clearInterval(this.timer);
      }
    }
  }

  /** 注册事件回调（每个事件仅保留最后一次注册） */
  on<K extends keyof ScheduleEvent<T>>(event: K, fn: NonNullable<ScheduleEvent<T>[K]>) {
    this.event[event] = fn;
  }

  /** 添加任务到待执行队列，同时累加总任务计数 */
  addTask(task: TrackedPromiseExecutor<T>) {
    this.totalTaskNum = this.totalTaskNum + 1;
    this.tasks.push(() => createTrackedPromise(task));
  }

  /** 启动调度器（重复调用无效） */
  startScheduler() {
    if (this.status === 'executing') return;

    this.status = 'executing';

    this.timer = setInterval(() => {
      // ① 终止检测：排队和执行中都为空 → 触发 over 事件，状态回到 idle
      if (this.tasks.length === 0 && this.executing.length === 0 && this._status === 'executing') {
        this.event['over']?.();
        this.status = 'idle';
      }

      // ② 分拣已完成的执行中任务
      const rejectedTask = this.executing.filter((t) => t.getStatus() === 'rejected');
      const fulfilledTask = this.executing.filter((t) => t.getStatus() === 'fulfilled');
      // 仅保留仍在 pending 的任务
      this.executing = this.executing.filter((t) => t.getStatus() === 'pending');

      // ③ 处理失败任务（重试或触发 failTask 回调）
      this.processRejectedTask(rejectedTask);
      // ④ 处理成功任务（触发 successTask 回调）
      this.processFulfilledTask(fulfilledTask);

      if (this.status === 'stop') {
        return;
      }

      // ⑤ 补充并发：从待执行队列取任务，填满至并发上限
      for (let i = 0; i < this.sameTimeTask - this.executing.length; i++) {
        if (this.tasks.length) {
          const task = this.tasks.shift();

          if (task) {
            // 调用工厂函数，创建 TrackedPromise（此时任务开始执行）
            const taskEntity = task();

            // 首次出现的 uid 初始化重试计数为 0
            if (!this.counter.has(taskEntity.getUid())) {
              this.counter.set(taskEntity.getUid(), 0);
            }

            this.executing.push(taskEntity);
          }
        }
      }

      // ⑥ 计算并广播整体进度：已完成数 / 总数
      //    注意：重试任务会重新入队并累加 totalTaskNum，进度不会倒退
      const rate =
        this.totalTaskNum > 0
          ? (this.totalTaskNum - (this.tasks.length + this.executing.length)) / this.totalTaskNum
          : 0;

      this.event['progressRate']?.(rate);
    }, this.loopInterval);
  }

  /**
   * 处理失败任务：
   * - 未超过重试次数 → 重新入队（追加到队列末尾），重试计数 +1
   * - 超过重试次数 → 触发 failTask 回调，清除计数器
   */
  private processRejectedTask(task: TrackedPromise<T>[]) {
    task.forEach((t) => {
      const id = t.getUid();
      const executor = t.getExecutor();

      const counter = this.counter.get(id) || 0;

      if (counter >= (this.retries || 0)) {
        // 重试耗尽，最终失败
        this.event['failTask']?.(t.getReason());
        this.counter.delete(id);
      } else {
        // 重新入队，累加 totalTaskNum 以保持进度单调递增
        this.tasks.push(() => createTrackedPromise(executor));
        this.totalTaskNum = this.totalTaskNum + 1;
        if (t.getReason() !== 'cancel') this.counter.set(id, counter + 1);
      }
    });
  }

  /** 处理成功任务：清除重试计数，触发 successTask 回调 */
  private processFulfilledTask(task: TrackedPromise<T>[]) {
    task.forEach((t) => {
      this.counter.delete(t.getUid());
      this.event['successTask']?.(t.getValue());
    });
  }

  /** 暂停调度器（清除定时器，已执行中的任务不受影响） */
  stop() {
    this.status = 'stop';
    clearInterval(this.timer);
    this.executing.forEach((e) => e.cancel());
  }

  /** 销毁调度器：清除定时器、清空所有队列和事件，不可恢复 */
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
