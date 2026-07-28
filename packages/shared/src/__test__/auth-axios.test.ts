import { describe, it, expect, vi } from 'vitest';
import { createAuthAxios } from '../utils/auth-axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// ---------- helpers ----------

/** 获取 axios 实例上的请求拦截器处理函数 */
function getRequestInterceptorHandlers(instance: AxiosInstance) {
  // axios 内部使用 handlers 数组存储拦截器
  return (instance.interceptors.request as any).handlers as Array<{
    fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
    rejected: (error: any) => any;
  }>;
}

// ---------- tests ----------

describe('createAuthAxios', () => {
  // ============================================================
  // 返回类型
  // ============================================================
  describe('return value', () => {
    it('should return an AxiosInstance', () => {
      const instance = createAuthAxios('http://localhost', () => 'token');
      expect(instance).toBeDefined();
      expect(typeof instance.get).toBe('function');
      expect(typeof instance.post).toBe('function');
    });

    it('should set baseURL correctly', () => {
      const instance = createAuthAxios('http://example.com/api', () => 'token');
      expect(instance.defaults.baseURL).toBe('http://example.com/api');
    });

    it('should set timeout to 60000', () => {
      const instance = createAuthAxios('http://localhost', () => 'token');
      expect(instance.defaults.timeout).toBe(60000);
    });
  });

  // ============================================================
  // baseURL
  // ============================================================
  describe('baseURL', () => {
    it('should accept https URL', () => {
      const instance = createAuthAxios('https://secure.example.com', () => 'token');
      expect(instance.defaults.baseURL).toBe('https://secure.example.com');
    });

    it('should accept URL with path', () => {
      const instance = createAuthAxios('http://localhost:8080/v1/api', () => 'token');
      expect(instance.defaults.baseURL).toBe('http://localhost:8080/v1/api');
    });

    it('should accept URL with trailing slash', () => {
      const instance = createAuthAxios('http://localhost/api/', () => 'token');
      expect(instance.defaults.baseURL).toBe('http://localhost/api/');
    });

    it('should handle empty string baseUrl', () => {
      const instance = createAuthAxios('', () => 'token');
      expect(instance.defaults.baseURL).toBe('');
    });
  });

  // ============================================================
  // Authorization header injection
  // ============================================================
  describe('Authorization header', () => {
    it('should inject Authorization header via getAuthTokenFn', () => {
      const getToken = vi.fn(() => 'Bearer my-secret-token');
      const instance = createAuthAxios('http://localhost', getToken);

      const handlers = getRequestInterceptorHandlers(instance);
      const config = handlers[0].fulfilled({
        headers: {} as any,
      } as InternalAxiosRequestConfig);

      expect(config.headers['Authorization']).toBe('Bearer my-secret-token');
    });

    it('should call getAuthTokenFn on each request', () => {
      const getToken = vi.fn(() => 'token');
      const instance = createAuthAxios('http://localhost', getToken);

      const handlers = getRequestInterceptorHandlers(instance);

      // 第一次请求
      handlers[0].fulfilled({ headers: {} as any } as InternalAxiosRequestConfig);
      // 第二次请求
      handlers[0].fulfilled({ headers: {} as any } as InternalAxiosRequestConfig);

      expect(getToken).toHaveBeenCalledTimes(2);
    });

    it('should not call getAuthTokenFn before making a request', () => {
      const getToken = vi.fn(() => 'token');
      createAuthAxios('http://localhost', getToken);

      // 创建实例时不应调用 getAuthTokenFn（拦截器在请求时才触发）
      expect(getToken).not.toHaveBeenCalled();
    });

    it('should handle empty token', () => {
      const getToken = vi.fn(() => '');
      const instance = createAuthAxios('http://localhost', getToken);

      const handlers = getRequestInterceptorHandlers(instance);
      const config = handlers[0].fulfilled({
        headers: {} as any,
      } as InternalAxiosRequestConfig);

      expect(config.headers['Authorization']).toBe('');
    });
  });

  // ============================================================
  // 请求配置保持
  // ============================================================
  describe('request config', () => {
    it('should preserve existing request config properties', () => {
      const instance = createAuthAxios('http://localhost', () => 'token');

      const handlers = getRequestInterceptorHandlers(instance);
      const config = handlers[0].fulfilled({
        headers: {} as any,
        url: '/users',
        method: 'post',
        data: { name: 'test' },
      } as InternalAxiosRequestConfig);

      expect(config.url).toBe('/users');
      expect(config.method).toBe('post');
      expect(config.data).toEqual({ name: 'test' });
    });

    it('should preserve existing headers when adding Authorization', () => {
      const instance = createAuthAxios('http://localhost', () => 'token');

      const handlers = getRequestInterceptorHandlers(instance);
      const config = handlers[0].fulfilled({
        headers: { 'Content-Type': 'application/json' } as any,
      } as InternalAxiosRequestConfig);

      expect(config.headers['Content-Type']).toBe('application/json');
      expect(config.headers['Authorization']).toBe('token');
    });

    it('should override existing Authorization header', () => {
      const instance = createAuthAxios('http://localhost', () => 'new-token');

      const handlers = getRequestInterceptorHandlers(instance);
      const config = handlers[0].fulfilled({
        headers: { Authorization: 'old-token' } as any,
      } as InternalAxiosRequestConfig);

      expect(config.headers['Authorization']).toBe('new-token');
    });
  });

  // ============================================================
  // 错误拦截器
  // ============================================================
  describe('error interceptor', () => {
    it('should reject with the error on request error', async () => {
      const instance = createAuthAxios('http://localhost', () => 'token');
      const error = new Error('network error');

      const handlers = getRequestInterceptorHandlers(instance);

      try {
        await handlers[0].rejected(error);
        // 不应该走到这里
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    it('should reject with any value on request error', async () => {
      const instance = createAuthAxios('http://localhost', () => 'token');

      const handlers = getRequestInterceptorHandlers(instance);

      try {
        await handlers[0].rejected('string error');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBe('string error');
      }
    });
  });

  // ============================================================
  // 不同 token 来源
  // ============================================================
  describe('token function', () => {
    it('should handle function returning dynamic token', () => {
      let counter = 0;
      const getToken = () => `token-${++counter}`;
      const instance = createAuthAxios('http://localhost', getToken);

      const handlers = getRequestInterceptorHandlers(instance);

      const config1 = handlers[0].fulfilled({ headers: {} as any } as InternalAxiosRequestConfig);
      expect(config1.headers['Authorization']).toBe('token-1');

      const config2 = handlers[0].fulfilled({ headers: {} as any } as InternalAxiosRequestConfig);
      expect(config2.headers['Authorization']).toBe('token-2');
    });

    it('should handle function returning Bearer token format', () => {
      const instance = createAuthAxios('http://localhost', () => 'Bearer eyJhbGciOiJIUzI1NiJ9');

      const handlers = getRequestInterceptorHandlers(instance);
      const config = handlers[0].fulfilled({ headers: {} as any } as InternalAxiosRequestConfig);

      expect(config.headers['Authorization']).toBe('Bearer eyJhbGciOiJIUzI1NiJ9');
    });
  });

  // ============================================================
  // 实例隔离
  // ============================================================
  describe('instance isolation', () => {
    it('should create independent instances with different baseURLs', () => {
      const instance1 = createAuthAxios('http://api1.example.com', () => 'token1');
      const instance2 = createAuthAxios('http://api2.example.com', () => 'token2');

      expect(instance1.defaults.baseURL).toBe('http://api1.example.com');
      expect(instance2.defaults.baseURL).toBe('http://api2.example.com');
    });

    it('should create independent instances with different tokens', () => {
      const instance1 = createAuthAxios('http://localhost', () => 'token-A');
      const instance2 = createAuthAxios('http://localhost', () => 'token-B');

      const handlers1 = getRequestInterceptorHandlers(instance1);
      const handlers2 = getRequestInterceptorHandlers(instance2);

      const config1 = handlers1[0].fulfilled({ headers: {} as any } as InternalAxiosRequestConfig);
      const config2 = handlers2[0].fulfilled({ headers: {} as any } as InternalAxiosRequestConfig);

      expect(config1.headers['Authorization']).toBe('token-A');
      expect(config2.headers['Authorization']).toBe('token-B');
    });
  });
});
