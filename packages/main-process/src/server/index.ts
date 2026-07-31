import fs from 'node:fs';
import Router from '@koa/router';
import Koa from 'koa';
import Koa2Connect from 'koa2-connect';
import { serve } from './send/serve';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import { app } from 'electron';

export function createServer() {
  const server = new Koa();

  const router = new Router();

  server.use(router.routes()).use(router.allowedMethods());

  server.use(
    serve(path.resolve(app.getAppPath(), '..', 'public'), {
      brotli: true,
    }),
  );

  server.listen(PORT, () => {
    console.log('server start');
  });
}
