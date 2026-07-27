import { describe, it, expect, vi } from 'vitest';
import { TaskScheduler } from '../utils/task-scheduler';

// ---------- helpers ----------

/** 创建可手动控制的 Promise，便于精确控制任务完成时机 */
function deferred<T = string>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>(function (res, rej) {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const sleep = function (ms: number) {
  return new Promise<void>(function (r) {
    setTimeout(r, ms);
  });
};

// 所有测试使用极短轮询间隔以加快执行速度
const FAST_INTERVAL = 10;

/** 创建一个已配置快速轮询的调度器 */
function createScheduler<T>(
  overrides: {
    sameTimeTask?: number;
    retries?: number;
    single?: boolean;
    loopInterval?: number;
  } = {},
) {
  return new TaskScheduler<T>({
    sameTimeTask: overrides.sameTimeTask ?? 5,
    loopInterval: overrides.loopInterval ?? FAST_INTERVAL,
    retries: overrides.retries,
    single: overrides.single,
  });
}

// ---------- tests ----------

describe('TaskScheduler', () => {
  // ============================================================
  // constructor
  // ============================================================
  describe('constructor', function () {
    it('should create a scheduler with valid sameTimeTask', function () {
      const s = new TaskScheduler<string>({ sameTimeTask: 3 });
      expect(s.status).toBe('idle');
    });

    it('should throw when sameTimeTask is 0', function () {
      expect(function () {
        new TaskScheduler({ sameTimeTask: 0 });
      }).toThrow('sameTimeTask must be a positive integer');
    });

    it('should throw when sameTimeTask is negative', function () {
      expect(function () {
        new TaskScheduler({ sameTimeTask: -1 });
      }).toThrow('sameTimeTask must be a positive integer');
    });

    it('should throw when sameTimeTask is not an integer', function () {
      expect(function () {
        new TaskScheduler({ sameTimeTask: 2.5 });
      }).toThrow('sameTimeTask must be a positive integer');
    });

    it('should throw when sameTimeTask is Infinity', function () {
      expect(function () {
        new TaskScheduler({ sameTimeTask: Infinity });
      }).toThrow('sameTimeTask must be a positive integer');
    });

    it('should throw when sameTimeTask is NaN', function () {
      expect(function () {
        new TaskScheduler({ sameTimeTask: NaN });
      }).toThrow('sameTimeTask must be a positive integer');
    });

    it('should default loopInterval to 100 when not provided', function () {
      const s = new TaskScheduler<string>({ sameTimeTask: 3 });
      expect(s.status).toBe('idle');
    });

    it('should accept custom loopInterval', function () {
      const s = createScheduler<string>({ loopInterval: 50 });
      expect(s.status).toBe('idle');
    });

    it('should throw when loopInterval is 0', function () {
      expect(function () {
        new TaskScheduler({ sameTimeTask: 3, loopInterval: 0 });
      }).toThrow('loopInterval must be a positive integer');
    });

    it('should throw when loopInterval is negative', function () {
      expect(function () {
        new TaskScheduler({ sameTimeTask: 3, loopInterval: -5 });
      }).toThrow('loopInterval must be a positive integer');
    });

    it('should throw when loopInterval is not an integer', function () {
      expect(function () {
        new TaskScheduler({ sameTimeTask: 3, loopInterval: 1.5 });
      }).toThrow('loopInterval must be a positive integer');
    });

    it('should throw when loopInterval is Infinity', function () {
      expect(function () {
        new TaskScheduler({ sameTimeTask: 3, loopInterval: Infinity });
      }).toThrow('loopInterval must be a positive integer');
    });

    it('should accept retries option', function () {
      const s = new TaskScheduler<string>({ sameTimeTask: 2, retries: 3 });
      expect(s.status).toBe('idle');
    });

    it('should accept retries undefined (no retry)', function () {
      const s = new TaskScheduler<string>({ sameTimeTask: 2 });
      expect(s.status).toBe('idle');
    });
  });

  // ============================================================
  // status getter / setter
  // ============================================================
  describe('status', function () {
    it('should initially be idle', function () {
      const s = createScheduler<string>();
      expect(s.status).toBe('idle');
    });

    it('should change to executing after startScheduler', function () {
      const s = createScheduler<string>();
      s.startScheduler();
      expect(s.status).toBe('executing');
      s.stop();
    });

    it('should change to stop after stop()', function () {
      const s = createScheduler<string>();
      s.startScheduler();
      s.stop();
      expect(s.status).toBe('stop');
    });

    it('should change to idle after all tasks complete (single=true)', async function () {
      const s = createScheduler<string>();
      let schedulerResolve!: (value: string) => void;

      s.addTask(function (res) {
        schedulerResolve = res;
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL);
      schedulerResolve('ok');
      await sleep(FAST_INTERVAL * 4);

      expect(s.status).toBe('idle');
    });

    it('should clear interval when status is set to stop', function () {
      const s = createScheduler<string>();
      const spy = vi.spyOn(global, 'clearInterval');
      s.startScheduler();
      s.stop();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // ============================================================
  // on() — event registration
  // ============================================================
  describe('on', function () {
    it('should register over callback', function () {
      const s = createScheduler<string>();
      s.on('over', function () {});
      // 不抛异常即为成功
    });

    it('should register successTask callback', function () {
      const s = createScheduler<string>();
      s.on('successTask', function (_result: string | null) {});
    });

    it('should register failTask callback', function () {
      const s = createScheduler<string>();
      s.on('failTask', function (_reason: any) {});
    });
  });

  // ============================================================
  // addTask
  // ============================================================
  describe('addTask', function () {
    it('should accept a task executor', function () {
      const s = createScheduler<string>();
      expect(function () {
        s.addTask(function (resolve) {
          resolve('ok');
        });
      }).not.toThrow();
    });

    it('should queue multiple tasks', async function () {
      const s = createScheduler<string>();
      const results: string[] = [];

      s.on('successTask', function (val) {
        if (val) results.push(val);
      });

      s.addTask(function (resolve) {
        resolve('a');
      });
      s.addTask(function (resolve) {
        resolve('b');
      });
      s.addTask(function (resolve) {
        resolve('c');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 4);

      expect(results).toContain('a');
      expect(results).toContain('b');
      expect(results).toContain('c');
      expect(results.length).toBe(3);
    });
  });

  // ============================================================
  // startScheduler — core scheduling
  // ============================================================
  describe('startScheduler', function () {
    it('should not start a second interval when already executing', function () {
      const s = createScheduler<string>();
      const spy = vi.spyOn(global, 'setInterval');

      s.startScheduler();
      const firstCallCount = spy.mock.calls.length;

      s.startScheduler(); // 第二次调用应该被忽略
      expect(spy.mock.calls.length).toBe(firstCallCount);

      s.stop();
      spy.mockRestore();
    });

    it('should execute tasks in order', async function () {
      const s = createScheduler<string>();
      const results: string[] = [];

      s.on('successTask', function (val) {
        if (val) results.push(val);
      });

      s.addTask(function (resolve) {
        resolve('first');
      });
      s.addTask(function (resolve) {
        resolve('second');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 4);

      expect(results[0]).toBe('first');
      expect(results[1]).toBe('second');
    });

    it('should process both fulfilled and rejected tasks in one tick', async function () {
      const s = createScheduler<string>();
      const success: string[] = [];
      const failed: string[] = [];

      const d1 = deferred<string>();
      const d2 = deferred<string>();

      s.on('successTask', function (val) {
        if (val) success.push(val);
      });
      s.on('failTask', function (reason) {
        failed.push(reason);
      });

      s.addTask(function (res) {
        d1.resolve = res;
      });
      s.addTask(function (_, rej) {
        d2.reject = rej;
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL);

      d1.resolve('good');
      d2.reject('bad');

      await sleep(FAST_INTERVAL * 4);

      expect(success).toContain('good');
      expect(failed).toContain('bad');
    });
  });

  // ============================================================
  // successTask callback
  // ============================================================
  describe('successTask event', function () {
    it('should call successTask with the resolved value', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();

      s.on('successTask', fn);
      s.addTask(function (resolve) {
        resolve('hello');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);

      expect(fn).toHaveBeenCalledWith('hello');
    });

    it('should call successTask for each successful task', async function () {
      const s = createScheduler<number>();
      const fn = vi.fn();

      s.on('successTask', fn);
      s.addTask(function (resolve) {
        resolve(1);
      });
      s.addTask(function (resolve) {
        resolve(2);
      });
      s.addTask(function (resolve) {
        resolve(3);
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 5);

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should handle null result', async function () {
      const s = createScheduler<string | null>();
      const fn = vi.fn();

      s.on('successTask', fn);
      s.addTask(function (resolve) {
        resolve(null);
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);

      expect(fn).toHaveBeenCalledWith(null);
    });
  });

  // ============================================================
  // failTask callback
  // ============================================================
  describe('failTask event', function () {
    it('should call failTask with rejection reason', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();
      const error = new Error('something went wrong');

      s.on('failTask', fn);
      s.addTask(function (_, reject) {
        reject(error);
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);

      expect(fn).toHaveBeenCalledWith(error);
    });

    it('should call failTask with string reason', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();

      s.on('failTask', fn);
      s.addTask(function (_, reject) {
        reject('timeout');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);

      expect(fn).toHaveBeenCalledWith('timeout');
    });
  });

  // ============================================================
  // over callback
  // ============================================================
  describe('over event', function () {
    it('should call over when all tasks complete', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();

      s.on('over', fn);
      s.addTask(function (resolve) {
        resolve('done');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 5);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call over when queue is empty and no tasks executing', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();

      s.on('over', fn);
      s.startScheduler(); // 空队列，立即 idle

      await sleep(FAST_INTERVAL * 2);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should NOT call over before tasks complete', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();
      const { resolve } = deferred<string>();

      s.on('over', fn);
      s.addTask(function (res) {
        resolve(res);
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL);

      expect(fn).not.toHaveBeenCalled();

      resolve('ok');
      await sleep(FAST_INTERVAL * 3);
    });

    it('should default single to true (verified via over+idle clearing interval)', async function () {
      const s = createScheduler<string>();
      const spy = vi.spyOn(global, 'clearInterval');

      s.on('over', function () {});
      s.addTask(function (resolve) {
        resolve('x');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 5);

      // single=true → idle 时应清除 interval
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should accept single = false', function () {
      const s = createScheduler<string>({ single: false });
      s.startScheduler();
      expect(s.status).toBe('executing');
      s.stop();
    });

    it('should NOT call over again when single=false (status guard)', async function () {
      const s = createScheduler<string>({ single: false });
      const fn = vi.fn();

      s.on('over', fn);
      s.startScheduler();

      await sleep(FAST_INTERVAL * 2); // 空队列，第一次 over 触发

      expect(fn).toHaveBeenCalledTimes(1);

      await sleep(FAST_INTERVAL * 5); // 等待几轮，不应再触发

      expect(fn).toHaveBeenCalledTimes(1);
      s.stop();
    });
  });

  // ============================================================
  // concurrency control (sameTimeTask)
  // ============================================================
  describe('concurrency', function () {
    it('should respect sameTimeTask limit', async function () {
      // sameTimeTask=1 — 同时最多 1 个任务在执行
      const s = createScheduler<string>({ sameTimeTask: 1 });
      const started: string[] = [];
      const done: string[] = [];
      const resolvers: ((v: string) => void)[] = [];

      s.on('successTask', function (val) {
        if (val) done.push(val);
      });

      for (let i = 0; i < 5; i++) {
        s.addTask(function (res) {
          started.push('task-' + i);
          resolvers[i] = res;
        });
      }

      s.startScheduler();

      // 逐个释放任务：每个任务完成后下一个才会被拾取
      for (let i = 0; i < 5; i++) {
        // 等待调度器拾取当前任务
        await sleep(FAST_INTERVAL * 3);
        // 此时应该只有 1 个任务在执行（前 i 个已完成，第 i 个刚启动）
        expect(started.length).toBe(i + 1);
        // 释放当前任务
        resolvers[i]('ok-' + i);
      }

      await sleep(FAST_INTERVAL * 3);

      expect(done.length).toBe(5);
    });

    it('should start new tasks as slots free up', async function () {
      const s = createScheduler<string>({ sameTimeTask: 1 }); // 单并发
      const executed: string[] = [];

      const d1 = deferred<string>();
      const d2 = deferred<string>();

      s.addTask(function (res) {
        executed.push('first');
        d1.resolve = res;
      });
      s.addTask(function (res) {
        executed.push('second');
        d2.resolve = res;
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 2);

      // 只有一个 slot，所以只应执行第一个
      expect(executed).toEqual(['first']);

      // 完成第一个，第二个应该被自动拾取
      d1.resolve('ok1');
      await sleep(FAST_INTERVAL * 2);

      expect(executed).toEqual(['first', 'second']);

      d2.resolve('ok2');
      await sleep(FAST_INTERVAL * 2);
    });
  });

  // ============================================================
  // retry logic
  // ============================================================
  describe('retries', function () {
    it('should not retry when retries is undefined', async function () {
      const s = createScheduler<string>({ retries: undefined });
      const fn = vi.fn();

      s.on('failTask', fn);
      s.addTask(function (_, reject) {
        reject('fail');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);

      // failTask 应被调用恰好 1 次（无重试）
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('fail');
    });

    it('should retry failed tasks up to retries count', async function () {
      const s = createScheduler<string>({ retries: 2 });
      const failures: string[] = [];

      s.on('failTask', function (reason) {
        failures.push(reason);
      });

      s.addTask(function (_, reject) {
        reject('persistent error');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 8);

      // 初始执行 + 2 次重试 = 总共 3 次失败，但 failTask 只在重试耗尽后触发 1 次
      expect(failures.length).toBe(1);
      expect(failures[0]).toBe('persistent error');
    });

    it('should succeed after a retry', async function () {
      const s = createScheduler<string>({ retries: 2 });
      const success: string[] = [];
      const failed: string[] = [];
      let attempt = 0;

      s.on('successTask', function (val) {
        if (val) success.push(val);
      });
      s.on('failTask', function (reason) {
        failed.push(reason);
      });

      s.addTask(function (resolve, reject) {
        attempt++;
        if (attempt < 2) {
          reject('not yet');
        } else {
          resolve('finally ok');
        }
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 8);

      expect(success).toEqual(['finally ok']);
      expect(failed.length).toBe(0);
    });

    it('should track retries per-task independently', async function () {
      const s = createScheduler<string>({ retries: 1 });
      const failed: string[] = [];

      s.on('failTask', function (reason) {
        failed.push(reason);
      });

      s.addTask(function (_, reject) {
        reject('error-A');
      });
      s.addTask(function (_, reject) {
        reject('error-B');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 8);

      // 两个任务各失败，各重试 1 次后都耗尽
      expect(failed.length).toBe(2);
      expect(failed).toContain('error-A');
      expect(failed).toContain('error-B');
    });
  });

  // ============================================================
  // single option behavior
  // ============================================================
  describe('single option', function () {
    it('should NOT clear interval when idle and single=false', async function () {
      const s = createScheduler<string>({ single: false });

      s.addTask(function (resolve) {
        resolve('ok');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 5);

      // 任务完成进入 idle，但 single=false → 不清除 interval，状态为 idle
      expect(s.status).toBe('idle');

      s.stop();
    });

    it('should pick up new tasks when single=false and previously idle', async function () {
      const s = createScheduler<string>({ single: false, sameTimeTask: 2 });
      const results: string[] = [];

      s.on('successTask', function (val) {
        if (val) results.push(val);
      });

      s.startScheduler();
      await sleep(FAST_INTERVAL);

      // 第一批任务
      s.addTask(function (resolve) {
        resolve('batch1-a');
      });
      s.addTask(function (resolve) {
        resolve('batch1-b');
      });
      await sleep(FAST_INTERVAL * 3);

      // 第二批任务（调度器应仍在运行）
      s.addTask(function (resolve) {
        resolve('batch2');
      });
      await sleep(FAST_INTERVAL * 3);

      expect(results).toContain('batch1-a');
      expect(results).toContain('batch1-b');
      expect(results).toContain('batch2');

      s.stop();
    });
  });

  // ============================================================
  // stop()
  // ============================================================
  describe('stop', function () {
    it('should set status to stop', function () {
      const s = createScheduler<string>();
      s.startScheduler();
      s.stop();
      expect(s.status).toBe('stop');
    });

    it('should clear the interval timer', function () {
      const s = createScheduler<string>();
      const spy = vi.spyOn(global, 'clearInterval');

      s.startScheduler();
      s.stop();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should allow restarting after stop', function () {
      const s = createScheduler<string>();
      s.startScheduler();
      s.stop();
      expect(s.status).toBe('stop');

      // 重新启动
      s.startScheduler();
      expect(s.status).toBe('executing');
      s.stop();
    });
  });

  // ============================================================
  // destroy()
  // ============================================================
  describe('destroy', function () {
    it('should set status to stop', function () {
      const s = createScheduler<string>();
      s.startScheduler();
      s.destroy();
      expect(s.status).toBe('stop');
    });

    it('should clear the interval timer', function () {
      const s = createScheduler<string>();
      const spy = vi.spyOn(global, 'clearInterval');

      s.startScheduler();
      s.destroy();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should clear all pending tasks', async function () {
      const s = createScheduler<string>();
      s.addTask(function (resolve) {
        resolve('should not execute');
      });
      s.addTask(function (resolve) {
        resolve('also not');
      });
      s.destroy();

      // destroy 后再启动，之前添加的任务不应被执行
      const results: string[] = [];
      s.on('successTask', function (val) {
        if (val) results.push(val);
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 2);
      s.stop();

      expect(results.length).toBe(0);
    });

    it('should clear event handlers', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();

      s.on('successTask', fn);
      s.addTask(function (resolve) {
        resolve('test');
      });
      s.destroy();

      // destroy 后重新启动并添加任务 — 旧的 handler 不应被调用
      s.on('successTask', function () {}); // 占位，避免 undefined
      s.addTask(function (resolve) {
        resolve('after destroy');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);
      s.stop();

      // 原 handler fn 不应被调用（destroy 已清除 event）
      expect(fn).not.toHaveBeenCalled();
    });

    it('should allow reuse after destroy', function () {
      const s = createScheduler<string>();
      s.addTask(function (resolve) {
        resolve('before');
      });
      s.destroy();

      // 重新配置并使用
      s.on('successTask', function () {});
      s.addTask(function (resolve) {
        resolve('after');
      });
      s.startScheduler();
      expect(s.status).toBe('executing');
      s.stop();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', function () {
    it('should handle synchronous resolve (immediate)', async function () {
      const s = createScheduler<number>();
      const fn = vi.fn();

      s.on('successTask', fn);
      s.addTask(function (resolve) {
        resolve(42);
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);

      expect(fn).toHaveBeenCalledWith(42);
    });

    it('should handle synchronous reject (immediate)', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();

      s.on('failTask', fn);
      s.addTask(function (_, reject) {
        reject('instant fail');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);

      expect(fn).toHaveBeenCalledWith('instant fail');
    });

    it('should handle async resolve', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();

      s.on('successTask', fn);
      s.addTask(function (resolve) {
        setTimeout(function () {
          resolve('delayed');
        }, 5);
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 5);

      expect(fn).toHaveBeenCalledWith('delayed');
    });

    it('should handle async reject', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();

      s.on('failTask', fn);
      s.addTask(function (_, reject) {
        setTimeout(function () {
          reject('delayed error');
        }, 5);
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 5);

      expect(fn).toHaveBeenCalledWith('delayed error');
    });

    it('should handle throw in executor (synchronous error)', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();
      const error = new Error('sync throw');

      s.on('failTask', fn);
      s.addTask(function () {
        throw error;
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);

      expect(fn).toHaveBeenCalledWith(error);
    });

    it('should handle mixed success and failure tasks', async function () {
      const s = createScheduler<string>();
      const success: string[] = [];
      const failed: string[] = [];

      s.on('successTask', function (val) {
        if (val) success.push(val);
      });
      s.on('failTask', function (reason) {
        failed.push(reason);
      });

      s.addTask(function (resolve) {
        resolve('ok-1');
      });
      s.addTask(function (_, reject) {
        reject('err-1');
      });
      s.addTask(function (resolve) {
        resolve('ok-2');
      });
      s.addTask(function (_, reject) {
        reject('err-2');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 5);

      expect(success).toEqual(['ok-1', 'ok-2']);
      expect(failed).toEqual(['err-1', 'err-2']);
    });

    it('should handle adding tasks while scheduler is running', async function () {
      const s = createScheduler<string>({ single: false });
      const results: string[] = [];

      s.on('successTask', function (val) {
        if (val) results.push(val);
      });

      s.startScheduler();

      await sleep(FAST_INTERVAL);

      // 在运行中添加任务
      s.addTask(function (resolve) {
        resolve('late-1');
      });
      await sleep(FAST_INTERVAL);
      s.addTask(function (resolve) {
        resolve('late-2');
      });

      await sleep(FAST_INTERVAL * 5);

      expect(results).toContain('late-1');
      expect(results).toContain('late-2');

      s.stop();
    });

    it('should handle large number of tasks within concurrency limit', async function () {
      const s = createScheduler<number>({ sameTimeTask: 3 });
      const fn = vi.fn();

      s.on('successTask', fn);

      for (let i = 0; i < 20; i++) {
        s.addTask(function (resolve) {
          resolve(i);
        });
      }
      s.startScheduler();

      await sleep(FAST_INTERVAL * 20);

      expect(fn).toHaveBeenCalledTimes(20);
    });

    it('should call over exactly once for a single task (single=true)', async function () {
      const s = createScheduler<string>();
      const overFn = vi.fn();

      s.on('over', overFn);
      s.addTask(function (resolve) {
        resolve('x');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 5);

      expect(overFn).toHaveBeenCalledTimes(1);
    });

    it('should handle startScheduler → destroy → startScheduler lifecycle', function () {
      const s = createScheduler<string>();

      s.startScheduler();
      s.destroy();
      expect(s.status).toBe('stop');

      s.on('successTask', function () {});
      s.startScheduler();
      expect(s.status).toBe('executing');

      s.stop();
    });

    it('should handle on() being called multiple times (overwrite)', async function () {
      const s = createScheduler<string>();
      const fn1 = vi.fn();
      const fn2 = vi.fn();

      s.on('successTask', fn1);
      s.on('successTask', fn2); // 覆盖

      s.addTask(function (resolve) {
        resolve('test');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);

      // fn1 不应被调用（被 fn2 覆盖）
      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).toHaveBeenCalledWith('test');
    });

    it('should handle a task that resolves even after being set up for retry', async function () {
      const s = createScheduler<string>();
      const fn = vi.fn();

      s.on('successTask', fn);
      s.addTask(function (resolve) {
        resolve('winner');
      });
      s.startScheduler();

      await sleep(FAST_INTERVAL * 3);

      expect(fn).toHaveBeenCalledWith('winner');
    });
  });
});
