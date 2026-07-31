export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    if (event.headers.get('x-nitro-prerender')) {
      return;
    }

    const systemColorTheme = getCookie(event, '--system-color-theme');
    const colorMode = getCookie(event, '--amy-color-mode');

    const res = html.htmlAttrs
      .find((item) => {
        return item.trim().startsWith('data-color-mode-forced');
      })
      ?.replaceAll('"', '')
      ?.trim()
      ?.split('=');

    if (res) {
      html.htmlAttrs.push(`class="${res[1]}"`);
      html.htmlAttrs.push(`style="color-scheme:${res[1]}"`);
    } else {
      if (colorMode === 'system') {
        html.htmlAttrs.push(`class="${systemColorTheme}"`);
        html.htmlAttrs.push(`style="color-scheme:${systemColorTheme}"`);
      } else {
        html.htmlAttrs.push(`class="${colorMode}"`);
        html.htmlAttrs.push(`style="color-scheme:${colorMode}"`);
      }
    }
  });
});
