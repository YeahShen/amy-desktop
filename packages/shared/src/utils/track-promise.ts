export type PromiseStatus = 'pending' | 'fulfilled' | 'rejected';

export type Executor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
) => void;

export type TrackedPromise<T> = {
  promise: Promise<T>;
  getStatus: () => PromiseStatus;
  getValue: () => T | null;
  getReason: () => any;
  getExecutor: () => Executor<T>;
};

export function createTrackedPromise<T>(executor: Executor<T>): TrackedPromise<T> {
  let status: PromiseStatus = 'pending';
  let value: T | null = null;
  let reason: any = null;

  const promise = new Promise<T>((resolve, reject) => {
    try {
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
  };
}
