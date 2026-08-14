export default defineNuxtPlugin(() => {
  const htmlAttrs: Record<string, string> = {};

  useHead({ htmlAttrs });

  useRouter().afterEach((to) => {
    if (to.meta.colorMode) {
      htmlAttrs['data-color-mode-forced'] = to.meta.colorMode;
    }
  });
});
