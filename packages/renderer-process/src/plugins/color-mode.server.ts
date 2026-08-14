export default defineNuxtPlugin(() => {
  const route = useRoute();

  // 页面级强制主题：把 definePageMeta({ colorMode }) 注入 html 属性，
  // 由 server/plugins/html-transform.ts 读取并作为最终主题 class。
  // 用 getter + useRoute()（响应式），保证 SSR 首屏即生效。
  useHead(() => {
    const forced = route.meta.colorMode;
    return forced ? { htmlAttrs: { 'data-color-mode-forced': forced } } : {};
  });
});
