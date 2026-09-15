import type { Bounding } from '@amy/shared';

/**
 * 打开弹窗窗口（父窗口居中，modal 阻塞）
 * @param name     目标页面名（pages/*.vue，如 'settings'）
 * @param bounding 弹窗尺寸
 * @param onTop    是否置顶（true 时不居中、不阻塞）
 * @param args     附加 query 参数（主进程会自动注入 dialogId）
 */
export function openDialog<T>(
  name: string,
  bounding: Bounding,
  onTop: boolean,
  args: Record<string, string> = {},
  singleton: boolean = true,
) {
  return window.electronAPI.invoke<T>('open-dialog', { bounding, args, name, onTop, singleton });
}

/**
 * 弹窗页上下文：dialogId 与关闭回调
 * 需在弹窗页面 setup 中调用（通过路由 query 获取 dialogId）
 */
export function useDialog() {
  const route = useRoute();
  const dialogId = route.query.dialogId as string | undefined;

  /** 携带结果关闭弹窗；非弹窗窗口中使用时兜底直接关闭 */
  function close(result?: unknown) {
    if (dialogId) {
      window.electronAPI.closeDialog(dialogId, result);
    } else {
      window.close();
    }
  }

  return {
    dialogId,
    close,
  };
}
