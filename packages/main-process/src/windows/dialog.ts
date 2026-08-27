import { Bounding } from '@amy/shared';
import { BrowserWindow, Rectangle } from 'electron';
import qs from 'qs';

export function createDialogWindow(
  bounding: Bounding,
  name: string,
  args: Record<string, string>,
  withTopWindow: boolean,
  parent?: BrowserWindow | undefined,
) {
  let x, y;

  const { width, height } = bounding;

  if (parent && withTopWindow) {
    const bounds = parent?.getBounds() as Rectangle;

    x = withTopWindow ? undefined : bounds.x + parent.getBounds().width / 2 - width / 2;
    y = withTopWindow ? undefined : bounds.y + parent.getBounds().height / 2 - height / 2;
  }

  const win = createFrameWindow({
    width,
    height,
    x,
    y,
    parent: withTopWindow ? parent : undefined,
    modal: true,
  });

  win.loadURL(buildWindowUrl(name + '?' + qs.stringify(args)));

  win.once('ready-to-show', () => {
    win?.show();
  });

  return win;
}
