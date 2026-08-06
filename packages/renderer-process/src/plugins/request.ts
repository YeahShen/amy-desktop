export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const request = $fetch.create({
    baseURL: config.public.model === 'mock' ? '/mock/api' : '/api',
    async onResponseError({ response }) {
      if (response.status === 400) {
        throw createError({
          message: response._data.message,
        });
      }
    },
  });

  return {
    provide: {
      request,
    },
  };
});
