import { app } from 'electron';
import path from 'node:path';
import os from 'node:os';

export async function fullScreen() {
  const koffi = await new Promise<typeof import('koffi')>((resolve) => {
    if (app.isPackaged) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- koffi 为 CJS 原生模块，打包后仅能通过 require 加载
      resolve(require(path.resolve(app.getAppPath(), '..', 'koffi/index.cjs')));
    } else {
      import('koffi').then((res) => {
        resolve(res);
      });
    }
  });

  function checkWin32() {
    const shell32 = koffi.load('shell32.dll');
    const user32 = koffi.load('user32.dll');

    // 2. 声明类型与 API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- koffi 类型注册（有副作用，供下方字符串签名引用）
    const QUERY_USER_NOTIFICATION_STATE = koffi.out(
      koffi.pointer('QUERY_USER_NOTIFICATION_STATE', 'int'),
    );
    const SHQueryUserNotificationState = shell32.func(
      'int SHQueryUserNotificationState(QUERY_USER_NOTIFICATION_STATE pquns)',
    );

    // 定义 RECT 结构体
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- koffi 类型注册（有副作用，供 GetWindowRect 签名引用）
    const RECT = koffi.struct('RECT', {
      left: 'int',
      top: 'int',
      right: 'int',
      bottom: 'int',
    });

    const GetForegroundWindow = user32.func('intptr GetForegroundWindow()');
    const GetWindowRect = user32.func('bool GetWindowRect(intptr hWnd, _Out_ RECT *lpRect)');
    const GetSystemMetrics = user32.func('int GetSystemMetrics(int nIndex)');
    const IsIconic = user32.func('bool IsIconic(intptr hWnd)');
    const GetClassNameW = user32.func(
      'int GetClassNameW(intptr hWnd, _Out_ char16 *lpClassName, int nMaxCount)',
    );

    const SM_CXSCREEN = 0; // 主屏幕宽度
    const SM_CYSCREEN = 1; // 主屏幕高度

    // 桌面/系统窗口类名，这些窗口覆盖全屏但不属于全屏应用
    const SYSTEM_WINDOW_CLASSES = new Set([
      'Progman',
      'WorkerW',
      'Shell_TrayWnd',
      'Shell_SecondaryTrayWnd',
    ]);

    return async function check() {
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
        // 排除最小化的窗口
        if (IsIconic(hWnd)) {
          return false;
        }

        // 排除桌面/系统窗口（Progman、WorkerW、Shell_TrayWnd 等）
        const className = Buffer.alloc(256 * 2); // UTF-16, 256 chars
        GetClassNameW(hWnd, className as unknown as string, 256);
        const clsName = className.toString('utf16le').replace(/\0.*$/, '');
        if (SYSTEM_WINDOW_CLASSES.has(clsName)) {
          return false;
        }

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
    };
  }

  const platform = os.platform();

  if (platform === 'win32') {
    return {
      check: checkWin32(),
    };
  } else if (platform === 'linux') {
    return {
      check: () => Promise.resolve(false),
    };
  } else {
    return {
      check: () => Promise.resolve(false),
    };
  }
}
