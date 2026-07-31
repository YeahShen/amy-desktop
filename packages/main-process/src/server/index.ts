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

  server.use(
    Koa2Connect(
      createProxyMiddleware({
        pathFilter: '/resource/**/*',
        changeOrigin: true,
        secure: false,
        router: () => {
          return BASE_URL;
        },
        on: {
          proxyReq: (proxyReq, req) => {
            const url = req.url;
            proxyReq.setHeader('XPLATFORM', 'client');

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
          proxyReq(proxyReq, req) {
            proxyReq.setHeader('XPLATFORM', 'client');
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

  server.listen(PORT, () => {
    console.log('server start');
  });
}
