import { session, nativeTheme } from 'electron';

export async function initColorMode() {
  const sc = await session.defaultSession.cookies.get({
    url: HTML_URL,
    path: '/',
  });

  const amyColor = sc.find((item) => item.name === AMY_COLOR_KEY)?.value;

  if (amyColor === 'system' || !amyColor) {
    const isDark = nativeTheme.shouldUseDarkColors;

    session.defaultSession.cookies.set({
      url: HTML_URL,
      path: '/',
      expirationDate: Math.floor(Date.now() / 1000) + 360000,
      name: SYSTEM_COLOR_KEY,
      value: isDark ? 'dark' : 'light',
    });
  }
}

export async function isDark() {
  const sc = await session.defaultSession.cookies.get({
    url: HTML_URL,
    path: '/',
  });
  const amyColor = sc.find((item) => item.name === AMY_COLOR_KEY)?.value;

  if (!!amyColor && amyColor !== 'system') {
    return amyColor === 'dark';
  }

  return nativeTheme.shouldUseDarkColors;
}
