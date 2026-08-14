import { getColorModeCookie } from '@amy/shared/utils/color-mode';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    if (event.headers.get('x-nitro-prerender')) {
      return;
    }

    // 页面级强制主题（如登录页 definePageMeta({ colorMode: 'dark' })），
    // 由 plugins/color-mode.server.ts 通过 useHead 注入
    const res = html.htmlAttrs
      .find((item) => {
        return item.trim().startsWith('data-color-mode-forced');
      })
      ?.replaceAll('"', '')
      ?.trim()
      ?.split('=');

    // 主进程 initColorMode 已把用户偏好（含 system）解析为最终主题写入 cookie
    const colorMode = res ? res[1] : (getCookie(event, getColorModeCookie()) ?? 'light');

    html.htmlAttrs.push(`class="${colorMode}"`);
    html.htmlAttrs.push(`style="color-scheme:${colorMode}"`);
  });
});
