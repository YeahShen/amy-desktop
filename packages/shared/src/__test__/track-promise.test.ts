import { describe, it, expect } from 'vitest';
import { createTrackedPromise } from '../utils/track-promise';

describe('createTrackedPromise', () => {
  it('should start with pending status', () => {
    const { getStatus } = createTrackedPromise(() => {});
    expect(getStatus()).toBe('pending');
  });

  it('should transition to fulfilled on resolve', async () => {
    const { promise, getStatus, getValue } = createTrackedPromise<number>((resolve) => {
      resolve(42);
    });

    await promise;
    expect(getStatus()).toBe('fulfilled');
    expect(getValue()).toBe(42);
  });

  it('should transition to rejected on reject', async () => {
    const error = new Error('test error');
    const { promise, getStatus, getReason } = createTrackedPromise<number>((_, reject) => {
      reject(error);
    });

    await promise.catch(() => {});
    expect(getStatus()).toBe('rejected');
    expect(getReason()).toBe(error);
  });

  it('should ignore second resolve call', async () => {
    const { promise, getValue } = createTrackedPromise<number>((resolve) => {
      resolve(1);
      resolve(2);
    });

    await promise;
    expect(getValue()).toBe(1);
  });

  it('should ignore second reject call', async () => {
    const error1 = new Error('first');
    const error2 = new Error('second');
    const { promise, getReason } = createTrackedPromise<number>((_, reject) => {
      reject(error1);
      reject(error2);
    });

    await promise.catch(() => {});
    expect(getReason()).toBe(error1);
  });

  it('should catch synchronous exceptions and reject', async () => {
    const error = new Error('sync error');
    const { promise, getStatus, getReason } = createTrackedPromise<number>(() => {
      throw error;
    });

    await promise.catch(() => {});
    expect(getStatus()).toBe('rejected');
    expect(getReason()).toBe(error);
  });

  it('should handle async resolve with delay', async () => {
    const { promise, getStatus, getValue } = createTrackedPromise<string>((resolve) => {
      setTimeout(() => resolve('done'), 10);
    });

    // should still be pending before the timeout fires
    expect(getStatus()).toBe('pending');

    await promise;
    expect(getStatus()).toBe('fulfilled');
    expect(getValue()).toBe('done');
  });

  it('should correctly track thenable resolution', async () => {
    const innerPromise = Promise.resolve(99);
    const { promise, getValue } = createTrackedPromise<number>((resolve) => {
      resolve(innerPromise);
    });

    await promise;
    expect(getValue()).toBe(99);
  });

  it('should return the same promise instance', async () => {
    const { promise } = createTrackedPromise<number>((resolve) => resolve(7));
    const result = await promise;
    expect(result).toBe(7);
  });

  it('should return the same promise instance with same executor', async () => {
    const { promise, getExecutor } = createTrackedPromise<number>((resolve) => resolve(7));

    const { promise: p2 } = createTrackedPromise(getExecutor());
    const r1 = await promise;
    const r2 = await p2;

    expect(r1).eq(r2);
  });
});
