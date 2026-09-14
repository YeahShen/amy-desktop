import { createServer as createProdServer, getRecVideoInfoUrlForProd } from './prod';
import { createServer as createDevServer, getRecVideoInfoUrlForDev } from './dev';
import { app } from 'electron';

export function createServer() {
  if (app.isPackaged) {
    createProdServer();
  } else {
    createDevServer();
  }
}

export function getRecVideoInfoUrl() {
  return app.isPackaged ? getRecVideoInfoUrlForProd() : getRecVideoInfoUrlForDev();
}
