import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 10,
  retryDelay: (retryCount) => {
    console.log('XXXXXX', retryCount);

    return retryCount * 1000;
  },
});

// ============ 类型定义 ============
interface ResponseData<T = any> {
  code: number;
  data: T;
  message: string;
}

type getAuthTokenFn = () => string;

export function createAuthAxios(baseUrl: string, getAuthTokenFn: getAuthTokenFn) {
  const service: AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 60000,
    headers: {
      // 'Content-Type': 'application/json',
    },
  });

  service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.headers['Authorization'] = getAuthTokenFn();

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  return service;
}
