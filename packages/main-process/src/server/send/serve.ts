import type { ParameterizedContext } from 'koa';
import assert from 'node:assert';
import { debug } from 'node:console';
import path from 'node:path';
import { send } from '.';

export function serve(root: string, opts: any) {
  assert(root, 'root directory is required to serve files');

  debug('static "%s" %j', root, opts);
  opts.root = path.resolve(root);
  opts.index = opts.index ?? 'index.html';

  if (!opts.defer) {
    return async function serve(ctx: ParameterizedContext, next: any) {
      let done: boolean | string | undefined = false;

      if (ctx.method === 'HEAD' || ctx.method === 'GET') {
        try {
          done = await send(ctx, ctx.path, opts);
        } catch (err: any) {
          if (err.status !== 404) {
            throw err;
          }
        }
      }

      if (!done) {
        await next();
      }
    };
  }

  return async function serve(ctx: ParameterizedContext, next: any) {
    await next();

    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
      return;
    }
    // response is already handled
    if (ctx.body != null || ctx.status !== 404) {
      return;
    }

    try {
      await send(ctx, ctx.path, opts);
    } catch (err: any) {
      if (err.status !== 404) {
        throw err;
      }
    }
  };
}
