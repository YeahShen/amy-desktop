import { app } from 'electron';
import path from 'node:path';

export async function checkFullScreen() {
  const koffi = await new Promise<typeof import('koffi')>((resolve) => {
    if (app.isPackaged) {
      resolve(require(path.resolve(app.getAppPath(), '.vite/scripts/koffi.cjs')));
    } else {
      import('koffi').then((res) => {
        resolve(res);
      });
    }
  });

  const shell32 = koffi.load('shell32.dll');
  const user32 = koffi.load('user32.dll');

  // 2. 声明类型与 API
  const QUERY_USER_NOTIFICATION_STATE = koffi.out(
    koffi.pointer('QUERY_USER_NOTIFICATION_STATE', 'int'),
  );
  const SHQueryUserNotificationState = shell32.func(
    'int SHQueryUserNotificationState(QUERY_USER_NOTIFICATION_STATE pquns)',
  );

  // 定义 RECT 结构体
  const RECT = koffi.struct('RECT', {
    left: 'int',
    top: 'int',
    right: 'int',
    bottom: 'int',
  });

  const GetForegroundWindow = user32.func('intptr GetForegroundWindow()');
  const GetWindowRect = user32.func('bool GetWindowRect(intptr hWnd, _Out_ RECT *lpRect)');
  const GetSystemMetrics = user32.func('int GetSystemMetrics(int nIndex)');

  const SM_CXSCREEN = 0; // 主屏幕宽度
  const SM_CYSCREEN = 1; // 主屏幕高度

  /**
   * 综合判断是否有应用（包括浏览器 F11、全屏视频、全屏游戏、PPT）处于全屏状态
   */
  function isAnyAppFullScreen() {
    // --- 方式 A：优先判断 Windows 系统级全屏 (游戏、PPT、视频) ---
    const pState = [0];
    const hr = SHQueryUserNotificationState(pState);
    if (hr === 0) {
      const state = pState[0];
      if (state === 2 || state === 3 || state === 4) {
        return true;
      }
    }

    // --- 方式 B：检测当前前台窗口（捕获 Chrome/Edge 等浏览器的 F11 全屏） ---
    const hWnd = GetForegroundWindow();
    if (hWnd) {
      const rect: Record<string, number> = {};
      if (GetWindowRect(hWnd, rect)) {
        const screenWidth = GetSystemMetrics(SM_CXSCREEN);
        const screenHeight = GetSystemMetrics(SM_CYSCREEN);

        const winWidth = rect.right - rect.left;
        const winHeight = rect.bottom - rect.top;

        // 如果当前获得焦点的窗口宽高大于或等于屏幕宽高，则判定为全屏
        if (winWidth >= screenWidth && winHeight >= screenHeight) {
          return true;
        }
      }
    }

    return false;
  }

  return {
    isAnyAppFullScreen,
  };
}
