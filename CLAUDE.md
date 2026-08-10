# CLAUDE.md

This is an Electron desktop app monorepo using pnpm workspaces.

## Project Structure

```
amy-desktop/
├── packages/
│   ├── main-process/        # Electron 主进程 (Node.js + Electron Forge + Vite)
│   ├── renderer-process/    # 渲染进程 (Nuxt 4 + Vue + Nuxt UI + Tailwind CSS)
│   ├── shared/              # 共享库 (@amy/shared, TypeScript + Vitest)
│   └── zpublisher/          # 自定义发布器 (@amy/publisher, Electron Forge Publisher)
├── .github/workflows/       # CI/CD (package.yml + publish.yml)
├── .claude/                 # Claude Code 配置和技能
├── eslint.config.mts        # 根 ESLint flat config
├── pnpm-workspace.yaml      # pnpm workspace 定义
├── .prettierrc.json         # Prettier 配置
├── .npmrc                   # pnpm registry mirror 配置
├── tsconfig.base.json       # 根 TS 基础配置
├── .env.development         # 开发环境变量
├── .env.production          # 生产环境变量
└── .vscode/settings.json    # VS Code 项目设置
```

### Main Process (`packages/main-process`)

```
main-process/
├── src/
│   ├── main.ts              # Electron 入口，创建 BrowserWindow，处理 Squirrel 事件
│   ├── preload/
│   │   ├── preload.ts       # Preload 脚本（electronAPI 尚未实现，当前为空模板）
│   │   └── tsconfig.json    # Preload 专用 TS 配置（CommonJS, DOM+ESNext）
│   ├── ipc-event/
│   │   ├── index.ts         # 汇总入口（import handle/send/on）
│   │   ├── channels.ts      # IPC 通道类型定义（OnEventChannels / HandleEventChannels / SendEventChannels）
│   │   ├── on.ts            # ipcMain.on 事件处理注册
│   │   ├── send.ts          # BrowserWindow.webContents.send 封装
│   │   └── handle.ts        # ipcMain.handle 事件处理注册
│   ├── server/
│   │   ├── index.ts         # 内置 HTTP 服务器入口（Koa + @koa/router）
│   │   └── send/
│   │       ├── index.ts     # koa-send 实现（brotli 压缩 + cheerio HTML color-mode 注入）
│   │       ├── serve.ts     # koa-static 风格中间件
│   │       └── type.ts      # SendOptions 类型定义
│   ├── stores/
│   │   ├── auth.ts          # 认证状态管理（electron-store 'amy-auth'，token + 用户信息）
│   │   ├── app-settings.ts  # 应用设置管理（electron-store 'amy-setting' + @amy/shared 构建器）
│   │   └── runtime-config.ts # 运行时配置（electron-store 'runtime-config'，窗口尺寸等）
│   ├── windows/
│   │   ├── login.ts         # 登录窗口创建与管理
│   │   ├── home.ts          # 主窗口创建与管理
│   │   ├── dialog.ts        # 弹窗窗口创建与管理
│   │   └── float.ts         # 浮动窗口创建与管理
│   ├── utils/
│   │   ├── constants.ts     # 常量定义（窗口尺寸、路径等）
│   │   ├── window.ts        # 窗口工具函数
│   │   ├── send.utils.ts    # 发送请求工具
│   │   ├── color-mode.ts    # 颜色模式工具（主题切换）
│   │   ├── full-screen.ts   # 全屏检测
│   │   ├── check-ipv6.ts    # IPv6 检测工具
│   │   └── squirrel.ts      # Squirrel 安装事件处理
│   └── updater/
│       ├── index.ts         # 更新检查入口（IPv6 感知 + StaticStorage update source）
│       └── updater.ts       # 自动更新逻辑（vendored update-electron-app 实现）
├── types/
│   ├── define.d.ts          # 自动生成：AMY_ 环境变量全局类型（由 vite.main.config.ts 生成）
│   ├── forge.env.d.ts       # Electron Forge 环境类型
│   ├── main-process-autoimport.d.ts # 自动生成：unplugin-auto-import 类型声明
│   ├── koa2-connect.d.ts    # koa2-connect 模块类型声明
│   └── *.d.ts               # 其他类型补丁
├── vite.main.config.ts      # Vite 构建配置 + unplugin-auto-import + define.d.ts 自动生成
├── vite.preload.config.ts   # Vite preload 构建配置
├── vitest.config.ts         # Vitest 测试配置
├── forge.config.ts          # Electron Forge 配置（打包/发布/签名/afterCopy/extraResource）
├── .eslintrc-auto-import.json # 自动生成：ESLint auto-import globals 声明
└── tsconfig.json            # 扩展 @tsconfig/node22
```

### Renderer Process (`packages/renderer-process`)

```
renderer-process/
├── src/
│   ├── app.vue              # Nuxt 根组件
│   ├── app.config.ts        # Nuxt UI 主题定制（formField label 等样式覆盖）
│   ├── pages/
│   │   ├── login.vue        # 登录页面
│   │   ├── home.vue         # 主页面（侧边栏 + 内容区）
│   │   └── float.vue        # 悬浮窗页面（empty 布局 + 透明背景）
│   ├── layouts/
│   │   ├── default.vue      # 默认布局（Navbar + Sidebar + MainContent）
│   │   └── empty.vue        # 空白布局（用于弹窗/悬浮窗窗口）
│   ├── components/
│   │   ├── amy/             # 通用组件（Logo、Scrollbar、Message、Combobox）
│   │   │   └── window/      # 窗口控制按钮（Close / MinSize / MaxSize）
│   │   ├── layout/          # 布局组件（Navbar、Sidebar、MainContent）
│   │   └── login/           # 登录页组件（Header、UsernameInput、Usernamepassword）
│   ├── composables/
│   │   ├── useRequest.ts    # useRequest / $request — 基于 Nuxt useFetch 的请求封装
│   │   ├── useMessage.ts    # 消息提示封装
│   │   └── useSettings.ts   # 应用设置读取（基于 electronAPI IPC）
│   ├── plugins/
│   │   └── request.ts       # $request 插件（$fetch 实例，mock 模式走 /mock/api，否则 /api）
│   ├── utils/
│   │   └── app-settings.ts  # getSetting/setSetting（appSettingBuilder + electronAPI IPC）
│   └── assets/
│       ├── css/
│       │   ├── main.css     # 主样式入口（全局 body/html 样式）
│       │   ├── tailwind.css # Tailwind CSS v4 导入层
│       │   ├── themes.css   # 主题系统（明/暗色模式变量）
│       │   └── fonts.css    # 自定义字体（Fredoka、Nunito woff2）
│       └── icons/           # 自定义图标目录（Nuxt Icon 自定义集合）
├── shared/
│   ├── electron-types.d.ts  # Window.electronAPI 全局类型声明（IPC、设置、文件操作）
│   └── page.d.ts            # 页面元数据类型扩展（页面级 colorMode、dialog 配置、侧边栏菜单）
├── server/                  # Nuxt Nitro 服务端
│   ├── middleware/
│   │   ├── api-proxy.ts     # /api/* 请求代理到后端，自动附加 Bearer token
│   │   └── static-resource-proxy.ts # /resource/* 静态资源代理
│   ├── routes/
│   │   ├── set-token.ts     # Token 写入路由（接收 ?token=xxx 参数写入文件）
│   │   └── mock/            # Mock 接口（模拟后端 API，前端独立开发时使用）
│   │       ├── api/auth/login-by-username-password.post.ts # 模拟登录接口
│   │       └── api/user/update-info.ts                     # 模拟更新用户信息
│   └── plugins/
│       └── html-transform.ts # HTML 渲染钩子，注入 color-mode class/style 属性
├── nuxt.config.ts           # Nuxt 配置（srcDir, modules, css, colorMode, runtimeConfig, nitro）
├── .output/public/          # 构建产物（静态生成）
└── .nuxt/                   # Nuxt 自动生成（勿手动编辑）
```

### Shared (`packages/shared`)

```
shared/src/
├── index.ts                 # 统一导出入口
├── utils/
│   ├── auth-axios.ts        # createAuthAxios — 带认证拦截器的 Axios 实例
│   ├── track-promise.ts     # createTrackedPromise — 可追踪状态的 Promise
│   ├── task-scheduler.ts    # TaskScheduler — 并发任务调度器（支持重试）
│   ├── file.ts              # fileChunk / fileStat / getFileSize — 文件分块
│   ├── upload-file.ts       # createUploadFileFn — 文件上传封装
│   ├── zip.ts               # makeZip — ZIP 压缩
│   ├── tools.ts             # Flatten / UnionToIntersection 类型工具
│   ├── user.ts              # User 接口定义和用户工具
│   └── app-settings.ts      # 应用设置类型定义与工具
├── __test__/                # Vitest 单元测试
│   ├── auth-axios.test.ts
│   ├── file.test.ts
│   ├── track-promise.test.ts
│   └── task-scheduler.test.ts
└── assets/                  # 图标 & 脚本资源
    ├── icon/                # 应用图标（PNG/ICO/ICNS/SVG）
    └── scripts/             # svg2png.py、koffi 原生模块等辅助脚本
```

### Publisher (`packages/zpublisher`)

```
zpublisher/src/
├── index.ts                 # 导出 PublisherBitbucket 和类型
├── publisher.ts             # PublisherBitbucket — 分块上传 + 校验 + 发布完成
├── config.ts                # PublisherBitbucketConfig 类型定义
└── __test__/
    └── publicher.test.ts    # 发布器测试
```

## Tech Stack

| Package | Key Dependencies |
|---------|-----------------|
| `packages/main-process` | Electron 43, Electron Forge 7, Vite 5, TypeScript 5.7, Node 22, Koa 3 (内置服务器), electron-store, electron-log, dotenv, unplugin-auto-import |
| `packages/renderer-process` | Nuxt 4.3, Vue 3, TypeScript 6, Nuxt UI 4, Tailwind CSS 4, Pinia, VueUse, @nuxtjs/color-mode, axios-retry |
| `packages/shared` | TypeScript 5.6, Vitest 2, axios, archiver, uuid, lodash-es |
| `packages/zpublisher` | @electron-forge/publisher-base, axios, form-data, Vitest 2 |
| Root | ESLint 10 (flat config), Prettier 3.9, TypeScript-ESLint 8 |

## Commands

```bash
# Root (run across all packages)
pnpm dev           # 并行启动所有包的 dev
pnpm build         # 构建所有包（先 renderer 后 main）
pnpm typecheck     # 类型检查
pnpm lint          # ESLint 检查并自动修复

# 打包 / 发布
pnpm package       # 构建渲染进程 + 打包 Electron 应用
pnpm make          # 构建渲染进程 + 打包安装包（Squirrel/ZIP/Deb/RPM）
pnpm publish       # 构建发布器 + 渲染进程 + 发布到远程

# Per-package
cd packages/main-process && pnpm dev     # 启动 Electron 开发模式
cd packages/renderer-process && pnpm dev # 启动 Nuxt 开发服务器
cd packages/shared && pnpm test          # 运行 Vitest 测试
cd packages/renderer-process && pnpm stage # 生成 staging 构建产物（⚠ 依赖 .env.stage，该文件当前不存在）
```

## Conventions

### Package Manager
- **Always use pnpm** — `packageManager: pnpm@9.15.4`, npm registry: `https://registry.npmmirror.com`
- hoist mode enabled, workspace linking enabled

### TypeScript
- Root `tsconfig.base.json`: target ES2022, strict, ESNext module, bundler resolution
- `packages/main-process`: extends `@tsconfig/node22`, `module: ESNext` + `moduleResolution: bundler`
- `packages/renderer-process`: uses Nuxt auto-generated tsconfig references (`.nuxt/tsconfig.*.json`)
- `packages/shared`: extends root `tsconfig.base.json`
- `packages/zpublisher`: extends `@tsconfig/node22`

### ESLint
- Flat config (`eslint.config.mts`), ESLint 10
- Root config covers JSON, main-process TypeScript, zpublisher TypeScript, and Nuxt renderer-process
- `eslint-config-prettier` integrated to avoid conflicts
- Global ignores: `**/node_modules/**`, `**/.nuxt/**`, `**/dist/**`, `**/.output/**`, `.vscode/**`, `**/tsconfig.json`

### Formatting
- Prettier: semicolons on, single quotes, 100 char print width
- VS Code: formatOnSave enabled, Prettier as default formatter, ESLint auto-fix on save
- Requires VS Code extensions: `esbenp.prettier-vscode`, `dbaeumer.vscode-eslint`

### Imports
- Internal workspace packages use `workspace:*` protocol
- Avoid relative imports between packages — use the published package name (e.g. `@amy/shared`, `@amy/publisher`)
- **`@amy/shared` exports raw TypeScript source** (`"exports": {".": "./src/index.ts"}`) — not compiled JS, consuming packages resolve it at build time

### Electron
- Uses Electron Forge for packaging/building
- Main process entry is `packages/main-process/src/main.ts`
- Uses `@electron-forge/plugin-vite` with separate Vite configs for main and preload
- `@electron/fuses` for security hardening (RunAsNode disabled, Asar integrity, cookie encryption, OnlyLoadAppFromAsar)
- Custom publisher (`@amy/publisher`) uploads artifacts to a Bitbucket-like release server with chunked upload + integrity check
- 多窗口架构：登录窗口（login）、主窗口（home）、弹窗窗口（dialog）、浮动窗口（float）
- 内置 Koa 服务器（`server/index.ts`）托管 Nuxt 静态构建产物（生产模式/打包后），支持 brotli 压缩，通过 cheerio 注入 color-mode HTML 属性
- `unplugin-auto-import` 自动导入 `src/utils`、`src/windows`、`src/stores`、`src/ipc-event` 中的导出函数，类型生成至 `types/main-process-autoimport.d.ts`
- `vite.main.config.ts` 从 `AMY_` 前缀环境变量生成 `types/define.d.ts` 全局类型声明
- IPC 通信框架已搭建（channel 类型、on/send/handle 文件），但 preload.ts 中 `electronAPI` 尚未实现
- Token 持久化：主进程通过 `_auth_token` 文件读写认证 token，渲染进程 Nitro server 代理时读取该文件

### Renderer (Nuxt)
- **Nuxt UI 4 + Tailwind CSS 4** — UI 组件和样式系统（`app.config.ts` 中可覆盖 UI 主题样式）
- **@nuxtjs/color-mode** — 支持 system/light/dark 主题切换，通过 cookie 持久化
- **Pinia** — 状态管理（通过 @pinia/nuxt 模块）
- **VueUse** — 组合式工具集（通过 @vueuse/nuxt 模块）
- **Nuxt Icon** — 自定义图标集合（`custom` 前缀，路径 `app/assets/icons`）
- 请求封装：`plugins/request.ts` 提供 `$request`（$fetch 实例），按 `AMY_MODE` 决定 baseURL（`mock` → `/mock/api`，否则 `/api`）；`composables/useRequest.ts` 提供 `useRequest`/`$request` 组合式封装
- **Mock 模式**：`AMY_MODE=mock` 时请求走 Nitro `server/routes/mock/` 下的模拟接口，无需启动后端即可调试前端流程（如登录）
- 布局组件：`components/layout/`（Navbar、Sidebar、MainContent），默认布局由三者组合
- 应用设置：渲染进程通过 `window.electronAPI` 的 getSetting/setSetting 读写主进程 electron-store（见 `utils/app-settings.ts`）
- Nitro server 在开发模式下提供 API 代理（`/api/*` → `apiUrl`）和静态资源代理（`/resource/*`）
- `html-transform` 插件注入服务端颜色模式属性到 HTML，避免 FOUC
- `set-token` 路由允许主进程将认证 token 传递给 Nitro 服务端
- 页面级元数据（`definePageMeta`）支持 `colorMode`、`dialog`、`sideBarMenu` 等自定义属性
- 构建产物通过 `extraResource` 配置打包到 Electron 应用中

### Testing
- `packages/shared` uses Vitest 2 — tests in `src/__test__/`
- `packages/zpublisher` uses Vitest 2 — tests in `src/__test__/`
- Run with `pnpm test` inside respective package directories

### Environment Variables
- `.env.development` — 开发环境（`AMY_APP_NAME=AMY_DEV`, `AMY_MODE=development`, `AMY_PORT=5326`）
- `.env.production` — 生产环境（`AMY_APP_NAME='AMY STATIONS'`, `AMY_MODE=production`, `AMY_PORT=32369`）
- 公共变量：`AMY_BASE_URL`（后端 API 地址）、`AMY_UPGRADE_URL`、`AMY_UPGRADE_IPV6_URL`（更新服务器地址）、`AMY_RAS_KEY`（RSA 公钥，登录密码加密用，对应后端私钥）
- Renderer dev/build 通过 `--dotenv ../../.env.{environment}` 加载环境变量
- Forge config 通过 dotenv 加载环境变量，`AMY_APP_NAME` 用于应用命名
- Publisher 凭证通过 `AMY_PUBLISH_USERNAME` / `AMY_PUBLISH_PASSWORD`（set in CI secrets）

### CI/CD (GitHub Actions)
- **package.yml** — triggered on push to `main`: builds Windows installer via `pnpm make`, uploads artifacts
- **publish.yml** — triggered on `v*` tag push: runs `pnpm publish` to deploy to release server
- Uses `pnpm/action-setup@v4`, Node 22, `--no-frozen-lockfile` for CI installs

## File Patterns

- **Do not manually edit** `packages/renderer-process/.nuxt/` or `.output/` — auto-generated by Nuxt
- `*.mts` files are TypeScript modules (ESM) — used for ESLint config and similar
- Type declaration files in `types/**/*.d.ts` per package
- Assets (icons, scripts) live in `packages/shared/src/assets/` — accessed via `@amy/shared` exports
- Renderer shared types (`packages/renderer-process/shared/`) — Nuxt 类型声明扩展，不参与构建产物
