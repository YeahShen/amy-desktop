import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { router as receiveRouter } from './receive';

export function createServer() {
  const server = new Koa();

  const router = new Router();

  // POST 请求体解析（JSON / form / text）
  server.use(
    bodyParser({
      enableTypes: ['json', 'form', 'text'],
      jsonLimit: '10mb',
      formLimit: '10mb',
    }),
  );

  server.use(router.routes()).use(router.allowedMethods());
  server.use(receiveRouter.routes()).use(receiveRouter.allowedMethods());

  server.listen(16532, () => {
    console.log('dev server start');
  });
}

export function getRecVideoInfoUrlForDev() {
  return `http://localhost:${16532}/recevie/video-info`;
}
