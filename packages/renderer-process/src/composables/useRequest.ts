import type { UseFetchOptions } from 'nuxt/app';

export function $request<T>(url: string, options: UseFetchOptions<T> = {}) {
  return (function (u: string, o: any) {
    return useNuxtApp().$request<T>(u, o);
  })(url, options);
}

export function useRequest<T>(url: string | (() => string), options: UseFetchOptions<T> = {}) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$request,
  });
}
