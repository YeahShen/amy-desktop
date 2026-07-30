declare module 'koa2-connect' {
  import type { Middleware } from 'koa'

  function koa2Connect(middleware: any): Middleware
  export = koa2Connect
}
