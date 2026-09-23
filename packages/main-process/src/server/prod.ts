import fs from 'node:fs';
import Router from '@koa/router';
import Koa from 'koa';
import Koa2Connect from 'koa2-connect';
import { serve } from './send/serve';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import { app } from 'electron';

import bodyParser from 'koa-bodyparser';

import { router as receiveRouter } from './receive';
import { getEnableUrl } from '../stores/api-url';

export function createServer() {
  const server = new Koa();

  server.use(
    Koa2Connect(
      createProxyMiddleware({
        pathFilter: '/resource/**/*',
        changeOrigin: true,
        secure: false,
        router: () => {
          return getEnableUrl();
        },
        on: {
          proxyReq: (proxyReq, req) => {
            const url = req.url;
            proxyReq.setHeader('X_PLATFORM', 'client');

            const resourceID = url?.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.')) || '';

            const token = getToken();
            if (token) {
              proxyReq.setHeader('Authorization', `Bearer ${token}`);
              proxyReq.setHeader('Resource-id', resourceID);
            }
          },
        },
      }),
    ),
  );

  server.use(
    Koa2Connect(
      createProxyMiddleware({
        pathFilter: '/api/**/*',
        changeOrigin: true,
        secure: false,
        router: () => {
          return BASE_URL;
        },
        on: {
          proxyReq(proxyReq) {
            proxyReq.setHeader('X_PLATFORM', 'client');
            const token = getToken();

            if (token) {
              proxyReq.setHeader('Authorization', `Bearer ${token}`);
            }
          },
        },
      }),
    ),
  );

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

  server.use(
    serve(path.resolve(app.getAppPath(), '..', 'public'), {
      brotli: true,
    }),
  );

  router.get('/local', (ctx) => {
    const { path } = ctx.query;
    ctx.set('Content-Type', 'image/png');
    ctx.body = fs.createReadStream(path as string);
  });

  server.use(receiveRouter.routes()).use(receiveRouter.allowedMethods());

  server.listen(PORT, () => {
    console.log('server start');
  });
}

export function getRecVideoInfoUrlForProd() {
  return `http://localhost:${PORT}/recevie/video-info`;
}
