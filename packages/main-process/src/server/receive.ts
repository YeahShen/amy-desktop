import Router from '@koa/router';
import { getAllDialog } from '../utils/dialog-manager';
import multer from '@koa/multer';

const router = new Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/recevie/video-info', upload.single('file'), async (ctx) => {
  // if (!(await getSetting('appRunSettings.enableSendVideoInfoApi'))) {
  //   ctx.body = `'amy station' send video api is diaable'`;
  //   return;
  // }

  const { category, title, fh, publishData, publisher, artist, type } = ctx.request.body as any;

  const file = ctx.file;

  const vInfo = {
    category,
    title,
    fh,
    publishData,
    publisher,
    posterData: file,
    artist,
    type,
  };

  getAllDialog().forEach((dia) => {
    if (dia.name === 'createVideoUpload') {
      dia.instance.webContents.send(SEND_EVENT.VIDEO_INFO, vInfo);

      if (dia.instance.isMinimized()) {
        dia.instance.restore(); // 从最小化恢复
      }

      dia.instance.setAlwaysOnTop(true);

      dia.instance.show(); // 如果被隐藏则显示出来
      dia.instance.focus(); // 拉到前台并获得键盘焦点
      dia.instance.setAlwaysOnTop(false);
    }
  });

  ctx.body = 'success';
});

export { router };
