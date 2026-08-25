export type PromiseStatus = 'pending' | 'fulfilled' | 'rejected';
import { v4 as uuidv4 } from 'uuid';

export type TrackedPromiseExecutor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
) => void;

export type TrackedPromise<T> = {
  promise: Promise<T>;
  getStatus: () => PromiseStatus;
  getValue: () => T | null;
  getReason: () => any;
  getExecutor: () => TrackedPromiseExecutor<T>;
  getUid: () => string;
  cancel: () => any;
};

export function createTrackedPromise<T>(executor: TrackedPromiseExecutor<T>): TrackedPromise<T> {
  let status: PromiseStatus = 'pending';
  let value: T | null = null;
  let reason: any = null;

  //检查 prototype 属性（箭头函数没有 prototype）
  if (!('prototype' in executor) || executor.prototype === undefined) {
    throw new Error('Arrow functions are not allowed.');
  }

  executor.prototype._uid = executor.prototype._uid || uuidv4();

  const controller = new AbortController();
  const signal = controller.signal;

  const promise = new Promise<T>((resolve, reject) => {
    try {
      signal.addEventListener('abort', () => {
        reject('cancel');
      });

      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  });

  // 通过 .then() 追踪状态，正确处理 thenable 值
  promise.then(
    (val) => {
      status = 'fulfilled';
      value = val;
    },
    (err) => {
      status = 'rejected';
      reason = err;
    },
  );

  return {
    promise, // 原始 Promise 实例
    getStatus: () => status, // 同步获取：'pending' | 'fulfilled' | 'rejected'
    getValue: () => value,
    getReason: () => reason,
    getExecutor: () => executor,
    getUid: () => executor.prototype._uid,
    cancel: () => controller.abort(),
  };
}
