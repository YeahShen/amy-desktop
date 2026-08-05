export default defineNuxtPlugin((nuxtApp) => {
  const request = $fetch.create({
    baseURL: '/api',
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
