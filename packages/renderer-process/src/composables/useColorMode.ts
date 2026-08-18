import { getColorModeCookie } from '@amy/shared/utils/color-mode';

export function useColorMode() {
  const colorMode = useCookie<'dark' | 'light'>(getColorModeCookie(), {
    path: '/',
    default: () => 'light',
  });

  const isDark = computed(() => colorMode.value === 'dark');

  /** 把主题应用到 <html>（class + color-scheme），SSR 首屏由 html-transform 完成 */
  function apply(mode: 'dark' | 'light') {
    if (!import.meta.client) return;
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.classList.toggle('light', mode === 'light');
    root.style.colorScheme = mode;
  }

  // cookie 变化（含外部改动）时同步到 <html>
  watch(colorMode, (mode) => {
    if (import.meta.client) apply(mode);
  });

  function toggleMode() {
    const next: 'dark' | 'light' = isDark.value ? 'light' : 'dark';
    colorMode.value = next;
    apply(next);
    if (import.meta.client) {
      window.electronAPI.setSetting('colorMode', next);
    }
  }

  return {
    colorMode,
    isDark,
    toggleMode,
  };
}
