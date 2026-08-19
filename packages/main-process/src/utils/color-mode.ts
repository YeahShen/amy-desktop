import { getColorModeCookie } from '@amy/shared';
import { session, nativeTheme } from 'electron';

export async function initColorMode() {
  session.defaultSession.cookies.set({
    url: HTML_URL,
    path: '/',
    name: getColorModeCookie(),
    value: await getColorModel(),
  });
}

export async function getColorModel() {
  const userSetColorModel = await getSetting('colorMode');

  let colorModel;

  if (userSetColorModel === 'system') {
    const isDark = nativeTheme.shouldUseDarkColors;

    colorModel = isDark ? 'dark' : 'light';
  } else {
    colorModel = userSetColorModel;
  }

  return colorModel;
}

export async function isDark() {
  return (await getColorModel()) === 'dark';
}
