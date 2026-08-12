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
├── .claude/                 # Claude Code 配置（settings.json 含 nuxt-ui MCP；skills: gitpush/publish）
├── eslint.config.mts        # 根 ESLint flat config
├── pnpm-workspace.yaml      # pnpm workspace 定义（packages/*）
├── .prettierrc.json         # Prettier 配置
├── .npmrc                   # pnpm registry mirror 配置（engine-strict、node-linker=hoisted）
├── tsconfig.base.json       # 根 TS 基础配置（strict, ESNext, bundler resolution）
├── tsconfig.json            # 根配置（仅覆盖 eslint.config.mts）
├── .env.development         # 开发环境变量（AMY_MODE=development）
├── .env.mock                # Mock 环境变量（AMY_MODE=mock）
├── .env.production          # 生产环境变量（AMY_MODE=production）
└── .vscode/settings.json    # VS Code 项目设置（formatOnSave + ESLint auto-fix + files.exclude）
```

### Main Process (`packages/main-process`)

```
main-process/
├── src/
│   ├── main.ts              # Electron 入口：单实例锁、Squirrel 事件、color-mode 初始化、
│   │                        # 全屏检测轮询（隐藏/显示悬浮窗）、按登录态开窗口、更新检查
│   ├── preload/
│   │   ├── preload.ts       # contextBridge 暴露 window.electronAPI（已实现）
│   │   └── tsconfig.json    # Preload 专用 TS 配置（CommonJS, DOM+ESNext）
│   ├── ipc-event/
│   │   ├── index.ts         # 汇总入口（import handle/send/on）
│   │   ├── channels.ts      # 通道定义：ON_EVENT(10) / HANDLE_EVENT(3) / SEND_EVENT(空)
│   │   ├── on.ts            # ipcMain.on：login、open-dev-tools、窗口控制、set-window-position、set-setting
│   │   ├── send.ts          # 空文件（尚无主→渲染推送通道）
│   │   └── handle.ts        # ipcMain.handle：get-screen-rect、get-window-position、get-setting
│   ├── server/
│   │   ├── index.ts         # 内置 Koa 服务器（打包态）：/api、/resource/* 代理到后端
│   │   │                    # （自动附加 Bearer token + X_PLATFORM: client），brotli 静态托管，/local 读图
│   │   └── send/
│   │       ├── index.ts     # koa-send 实现（brotli 压缩 + cheerio HTML color-mode 注入）
│   │       ├── serve.ts     # koa-static 风格中间件
│   │       └── type.ts      # SendOptions 类型定义
│   ├── stores/
│   │   ├── auth.ts          # 认证状态（electron-store 'amy-auth'，token + User + restart 标记）
│   │   ├── app-settings.ts  # 应用设置（electron-store 'amy-setting' + @amy/shared appSettingBuilder）
│   │   └── runtime-config.ts# 运行时配置（electron-store 'runtime-config'：主窗口尺寸、悬浮窗位置）
│   ├── windows/
│   │   ├── login.ts         # 登录窗口（360×440，无边框）
│   │   ├── home.ts          # 主窗口（尺寸持久化，关闭即退出应用）
│   │   ├── float.ts         # 悬浮窗（透明 + 置顶 + skipTaskbar + 位置持久化）
│   │   └── dialog.ts        # 空占位文件
│   ├── utils/
│   │   ├── constants.ts     # HTML_URL、HOME_WINDOW_BASE_SIZE、color-mode cookie 键
│   │   ├── window.ts        # createFrameWindow / buildWindowUrl（frame: false, contextIsolation: true）
│   │   ├── tray.ts          # 系统托盘（Win 左键切换主窗口显隐；仅登录成功后创建）
│   │   ├── color-mode.ts    # initColorMode / isDark（读写 cookie --amy-color-mode / --system-color-theme）
│   │   ├── full-screen.ts   # koffi 原生调用全屏检测（Windows：SHQueryUserNotificationState + 前台窗口矩形）
│   │   ├── squirrel.ts      # Squirrel 安装/卸载事件处理
│   │   ├── check-ipv6.ts    # IPv6 探测（ipv6.icanhazip.com，3s 超时）
│   │   └── send.utils.ts    # isPathExists / isPathHidden / getFileType
│   └── updater/
│       ├── index.ts         # 更新检查入口（IPv6 感知 + StaticStorage update source）
│       └── updater.ts       # 自动更新逻辑（vendored update-electron-app 实现）
├── types/
│   ├── define.d.ts          # 自动生成：AMY_ 环境变量全局常量类型（vite.main.config.ts 生成）
│   ├── forge.env.d.ts       # Electron Forge 环境类型
│   ├── main-process-autoimport.d.ts # 自动生成：unplugin-auto-import 类型声明
│   ├── koa2-connect.d.ts    # koa2-connect 模块类型声明
│   └── *.d.ts               # 其他类型补丁
├── vite.main.config.ts      # Vite 构建配置（AMY_ env → define + define.d.ts 生成 + auto-import）
├── vite.preload.config.ts   # Vite preload 构建配置
├── vitest.config.ts         # Vitest 测试配置
├── forge.config.ts          # Electron Forge 配置（Squirrel/ZIP/Deb/Rpm、Fuses、extraResource、@amy/publisher）
├── .eslintrc-auto-import.json # 自动生成：ESLint auto-import globals 声明
└── tsconfig.json            # 扩展 @tsconfig/node22
```

### Renderer Process (`packages/renderer-process`)

```
renderer-process/
├── src/
│   ├── app.vue              # Nuxt 根组件（F12 → open-dev-tools IPC）
│   ├── app.config.ts        # Nuxt UI 主题定制（formField label 等样式覆盖）
│   ├── pages/
│   │   ├── login.vue        # 登录页（empty 布局，RSA 密码加密 + $request 登录）
│   │   ├── home.vue         # 主页（空壳，workspace: 'home'）
│   │   ├── film.vue         # 影视页（空壳）
│   │   ├── photograph.vue   # 摄影页（空壳）
│   │   ├── artist.vue       # 艺术家页（空壳）
│   │   └── float.vue        # 悬浮窗页（empty 布局 + 透明背景，折叠圆形按钮/展开菜单 + 拖动 + 鼠标穿透）
│   ├── layouts/
│   │   ├── default.vue      # 默认布局（Sidebar + Navbar + MainContent）
│   │   └── empty.vue        # 空白布局（用于登录/悬浮窗）
│   ├── components/
│   │   ├── amy/             # 通用组件：Logo、Scrollbar、Message、Combobox、Skeleton、SwitchColorMode
│   │   │   └── window/      # 窗口控制按钮（Close / MinSize / MaxSize）
│   │   ├── layout/          # 布局组件（Navbar、Sidebar、MainContent）
│   │   └── login/           # 登录页组件（Header、UsernameInput、Usernamepassword）
│   ├── composables/
│   │   ├── useRequest.ts    # useRequest / $request — 基于 Nuxt useFetch 的请求封装
│   │   ├── useMessage.ts    # 全局消息提示（antd 风格 API：success/error/info/warning/loading/open/destroy/config）
│   │   └── useSettings.ts   # 应用设置读写（基于 electronAPI getSetting/setSetting + watch 回写）
│   ├── plugins/
│   │   └── request.ts       # $request 插件（$fetch 实例，mock 模式走 /mock/api，否则 /api）
│   ├── stores/
│   │   └── app.ts           # Pinia appStore（当前为空实现）
│   └── assets/
│       ├── css/
│       │   ├── main.css     # 全局 body/html 样式（高度 100%、overflow: hidden、user-select: none）
│       │   ├── tailwind.css # Tailwind CSS v4 导入层（@theme 主色调 + drag/no-drag utilities）
│       │   ├── themes.css   # 主题系统（--ui-* 语义色变量 + --sidebar-width/--navbar-height）
│       │   └── fonts.css    # 自定义字体（Fredoka、Nunito、Orbitron、PingFangSC-Regular woff2）
│       ├── icons/           # amy 自定义图标集合（Nuxt Icon custom 前缀，13 个 svg）
│       └── fonts/           # woff2 字体文件
├── shared/
│   ├── electron-types.d.ts  # Window.electronAPI 全局类型声明（IPC、设置、文件操作）
│   └── page.d.ts            # 页面元数据扩展（workspace、colorMode、dialog、requiresAuth）
├── server/                  # Nuxt Nitro 服务端
│   ├── middleware/
│   │   ├── api-proxy.ts     # /api/* 请求代理到后端（读 .nuxt/_auth_token 附加 Bearer + X_PLATFORM）
│   │   └── static-resource-proxy.ts # /resource/* 静态资源代理
│   ├── routes/
│   │   ├── set-token.ts     # Token 写入路由（?token=xxx 写入 .nuxt/_auth_token，dev/mock 模式用）
│   │   └── mock/            # Mock 接口（AMY_MODE=mock 时使用）
│   │       ├── api/auth/login-by-username-password.post.ts # 模拟登录接口
│   │       └── api/user/update-info.ts                     # 空实现占位
│   └── plugins/
│       └── html-transform.ts # HTML 渲染钩子，注入 color-mode class/style 属性（防 FOUC）
├── nuxt.config.ts           # Nuxt 配置（srcDir, modules, css, colorMode, runtimeConfig, nitro brotli, amy 图标集合）
└── tsconfig.json            # 引用 .nuxt 自动生成的 tsconfig
```

### Shared (`packages/shared`)

```
shared/src/
├── index.ts                 # 统一导出入口（另导出 ./favicon.ico 子路径）
├── utils/
│   ├── auth-axios.ts        # createAuthAxios — 带认证拦截器的 Axios 实例（60s 超时）
│   ├── track-promise.ts     # createTrackedPromise — 可同步查询状态/值/原因的 Promise
│   ├── task-scheduler.ts    # TaskScheduler — 并发任务调度器（重试 + 进度回调 + 事件）
│   ├── file.ts              # fileChunk / fileStat / getFileSize / getFileTotalChunks — 文件分块
│   ├── upload-file.ts       # createUploadFileFn — 文件分块上传封装（form-data）
│   ├── zip.ts               # makeZip — ZIP 压缩（archiver，level 9）
│   ├── tools.ts             # Flatten / UnionToIntersection 类型工具
│   ├── user.ts              # User / UserloggedCacheItem 接口定义
│   └── app-settings.ts      # AppSettings 类型 + appSettingBuilder（默认值兜底）
├── __test__/                # Vitest 单元测试
│   ├── auth-axios.test.ts
│   ├── file.test.ts
│   ├── track-promise.test.ts
│   └── task-scheduler.test.ts
└── assets/                  # 图标 & 脚本资源
    ├── icon/                # 应用图标（favicon.ico/icns/png 多尺寸 + logo svg）
    └── scripts/             # svg2png.py、koffi 原生模块（打包后作为 extraResource 分发）
```

### Publisher (`packages/zpublisher`)

```
zpublisher/src/
├── index.ts                 # 导出 PublisherBitbucket 和类型
├── publisher.ts             # PublisherBitbucket — 产物 ZIP → 分块上传（10 并发/5 重试）→ 完整性校验 → 发布完成
├── config.ts                # PublisherBitbucketConfig 类型定义
└── __test__/
    └── publicher.test.ts    # 发布器测试
```

## Tech Stack

| Package | Key Dependencies |
|---------|-----------------|
| `packages/main-process` | Electron 43.1.1, Electron Forge 7.11, Vite 5.4, TypeScript 5.7, Node 22, Koa 3.2 (内置服务器), electron-store 11, electron-log, koffi (原生 FFI), cheerio, dotenv, unplugin-auto-import |
| `packages/renderer-process` | Nuxt 4.3, Vue 3, TypeScript 6, Nuxt UI 4.10, Tailwind CSS 4.3, Pinia, VueUse 14, @nuxtjs/color-mode 4, axios-retry |
| `packages/shared` | TypeScript 5.6, Vitest 2, axios 1.18, archiver 8, uuid 14, lodash-es |
| `packages/zpublisher` | @electron-forge/publisher-base 7.11, axios, form-data, Vitest 2 |
| Root | ESLint 10 (flat config), Prettier 3.9.5, TypeScript-ESLint 8 |

## Commands

```bash
# Root (run across all packages)
pnpm dev           # 并行启动所有包的 dev（NODE_ENV=development）
pnpm dev:mock      # 并行启动 mock 模式（AMY_MODE=mock，无需后端）
pnpm build         # 构建所有包（renderer → main）
pnpm typecheck     # 类型检查
pnpm lint          # ESLint 检查并自动修复

# 打包 / 发布
pnpm package       # 构建渲染进程 + 打包 Electron 应用（electron-forge package）
pnpm make          # 构建渲染进程 + 打包安装包（Squirrel/ZIP/Deb/RPM）
pnpm publish       # 构建发布器 + 渲染进程 + 发布到远程

# Per-package
cd packages/main-process && pnpm dev     # 启动 Electron 开发模式（先确保 renderer dev 已在跑）
cd packages/renderer-process && pnpm dev # 启动 Nuxt 开发服务器（--dotenv ../../.env.development）
cd packages/renderer-process && pnpm dev:mock # Mock 模式开发
cd packages/shared && pnpm test          # 运行 Vitest 测试
cd packages/renderer-process && pnpm stage # 生成 staging 构建产物（⚠ 依赖 .env.stage，该文件当前不存在）
```

## Conventions

### Package Manager
- **Always use pnpm** — `packageManager: pnpm@9.15.4`, npm registry: `https://registry.npmmirror.com`
- `.npmrc`: `engine-strict=true`, `node-linker=hoisted`（hoist 模式），workspace 链接启用
- **主进程包依赖以 devDependencies 形式声明**（Forge + Vite 构建时打包），仅 electron-squirrel-startup 在 dependencies

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
- Uses Electron Forge 7 for packaging/building; main entry `src/main.ts`
- `@electron-forge/plugin-vite` with separate Vite configs for main and preload
- `@electron/fuses` 安全加固：RunAsNode 禁用、cookie 加密、Node options/cli inspect 禁用、Asar 完整性校验、OnlyLoadAppFromAsar
- 自定义发布器（`@amy/publisher`）分块上传产物到 `https://release.ashen-station.top`（credentials in `AMY_PUBLISH_USERNAME` / `AMY_PUBLISH_PASSWORD`）
- 多窗口架构：登录窗口（login）、主窗口（home）、浮动窗口（float）；dialog.ts 尚未实现
- 内置 Koa 服务器（`server/index.ts`）在**打包态**启动：代理 `/api`、`/resource` 到 `AMY_BASE_URL`（自动附加 Bearer token + `X_PLATFORM: client`），brotli 托管 Nuxt 静态产物，`/local?path=` 读任意图片
- **Preload 已实现**：`window.electronAPI` 暴露 `send(channel, ...args)` / `on(channel, fn)` / `invoke(channel, ...args)` / `getSetting` / `setSetting` / `getPathForFile`（对应类型声明见 renderer `shared/electron-types.d.ts`）
- IPC 通道（`ipc-event/channels.ts`）：`ON_EVENT` = login、open-dev-tools、set-ignore-mouse-events、get/set-window-position、close/hid/min-window、set-setting；`HANDLE_EVENT` = get-screen-rect、get-window-position、get-setting；`SEND_EVENT` 为空
- **登录流程**：渲染进程 RSA 公钥加密密码 → `POST /auth/login-by-username-password` → `electronAPI.send('login', user, token)` → 主进程 `setAuthenticate` + 创建主窗口 + 关闭登录窗 +（若开启）创建悬浮窗
- Token 持久化：主进程 electron-store `'amy-auth'`；dev/mock 模式另经 Nitro `set-token` 路由写入 `.nuxt/_auth_token` 供开发代理使用
- `unplugin-auto-import` 自动导入 `src/utils`、`src/windows`、`src/stores`、`src/ipc-event` 中的导出，类型生成至 `types/main-process-autoimport.d.ts`
- `vite.main.config.ts` 将 `AMY_` 前缀环境变量转为 `define` 全局常量，并生成 `types/define.d.ts` 类型声明
- 系统托盘：登录成功后创建，Win 左键单击切换主窗口显隐，菜单含"显示主窗口/退出"
- 全屏检测：koffi 调用 `SHQueryUserNotificationState` + 前台窗口矩形比对（仅 Windows 生效），每 1s 轮询以隐藏/显示悬浮窗
- 更新：StaticStorage 更新源（`AMY_UPGRADE_URL`，IPv6 可达时用 `AMY_UPGRADE_IPV6_URL`），baseUrl 拼 `${platform}/${arch}`

### Renderer (Nuxt)
- **Nuxt UI 4 + Tailwind CSS 4** — UI 组件和样式系统；自定义语义色通过 `themes.css` 的 `--ui-*` CSS 变量覆盖；`tailwind.css` 定义 primary 品牌色阶 + `drag`/`no-drag` 窗口拖拽 utilities
- **@nuxtjs/color-mode** — system/light/dark 三态，cookie 持久化（键 `--amy-color-mode`），主进程 `initColorMode` 同步系统主题到 `--system-color-theme` cookie；`html-transform` 插件注入 class/style 防 FOUC
- **Pinia** — 状态管理（`stores/app.ts`，当前为空）
- **VueUse** — 组合式工具集（useElementSize、useLocalStorage 等）
- **Nuxt Icon 自定义集合** — `amy` 前缀，路径 `src/assets/icons/`（13 个 svg：home-2-bold、videocamera-add-bold、photo、cup-star-bold-duotone、cloud-check-broken、settings-line-duotone、user-outlined、lock-outlined、eye/eye-off、minus、window-close、logo-base）；lucide 前缀用于通用图标
- 请求封装：`plugins/request.ts` 提供 `$request`（$fetch 实例），按 `AMY_MODE` 决定 baseURL（`mock` → `/mock/api`，否则 `/api`）；400 响应抛出 `createError`；`composables/useRequest.ts` 提供 `useRequest`/`$request` 封装
- **Mock 模式**（`pnpm dev:mock`，`.env.mock`）：请求走 Nitro `server/routes/mock/` 模拟接口，无需启动后端
- 应用设置：`composables/useSettings(key)` 通过 `window.electronAPI.getSetting/setSetting` 读写主进程 electron-store（'amy-setting'），watch 变化自动回写；键类型由 `@amy/shared` 的 `AppSettings` + `Flatten` 推导
- 布局组件：`components/layout/`（Navbar、Sidebar、MainContent），默认布局由三者组合；侧边栏菜单（home/film/photograph/artist）以页面 `workspace` meta 驱动高亮
- 悬浮窗（`pages/float.vue`）：折叠圆形 Logo 按钮 + 呼吸光晕，展开菜单（搜索/笔记/任务/设置），基于 `set-ignore-mouse-events` 实现鼠标穿透，拖拽移动窗口并持久化位置
- 页面级元数据（`definePageMeta`）：`workspace`（'home'|'film'|'photograph'|'artist'）、`dialog`（DialogMeta，尚未使用）
- 字体：Fredoka / Nunito / Orbitron / PingFangSC-Regular（woff2 本地加载）

### Testing
- `packages/shared` uses Vitest 2 — tests in `src/__test__/`
- `packages/zpublisher` uses Vitest 2 — tests in `src/__test__/`
- Run with `pnpm test` inside respective package directories

### Environment Variables
- 根目录三套环境文件：`.env.development`（AMY_MODE=development）、`.env.mock`（AMY_MODE=mock）、`.env.production`（AMY_MODE=production）
- `AMY_APP_NAME`：`AMY_DEV`（dev/mock）/ `AMY STATIONS`（prod，Forge 用其命名应用）
- `AMY_BASE_URL`：dev `http://127.0.0.1:8080/`；prod `https://amy-api.ashen-station.site/`
- `AMY_PORT`：5326（dev/mock）/ 32369（prod）— 内置服务器监听端口，渲染进程 dev server 同端口
- `AMY_UPGRADE_URL` / `AMY_UPGRADE_IPV6_URL`：更新服务器地址（prod 为 release.ashen-station.top / release.ashen-station.site）
- `AMY_RAS_KEY`：RSA 公钥（登录密码加密用，对应后端私钥）
- Publisher 凭证 `AMY_PUBLISH_USERNAME` / `AMY_PUBLISH_PASSWORD`（CI secrets 注入，forge.config.ts dotenv 读取）

### CI/CD (GitHub Actions)
- **package.yml** — triggered on push to `main`: builds Windows installer via `pnpm make`, uploads artifacts
- **publish.yml** — triggered on `v*` tag push: runs `pnpm publish` to deploy to release server
- Uses `pnpm/action-setup@v4`, Node 22, `--no-frozen-lockfile` for CI installs

## File Patterns

- **Do not manually edit** `packages/renderer-process/.nuxt/` or `.output/` — auto-generated by Nuxt
- **Do not manually edit** `packages/main-process/out/`、`.vite/`、`types/define.d.ts`、`types/main-process-autoimport.d.ts`、`.eslintrc-auto-import.json` — 构建/插件自动生成
- `*.mts` files are TypeScript modules (ESM) — used for ESLint config and similar
- Type declaration files in `types/**/*.d.ts` per package
- Assets (icons, fonts, scripts) live in `packages/shared/src/assets/` (icon/koffi scripts) 或 `packages/renderer-process/src/assets/` (css/icons/fonts)
- Renderer shared types (`packages/renderer-process/shared/`) — Nuxt 类型声明扩展（electronAPI、PageMeta），不参与构建产物
- 模板字符串风格的 IPC 通道：preload 的 `electronAPI` 类型从主进程 `channels.ts` 导入，渲染进程通过 `shared/electron-types.d.ts` 声明全局 `Window.electronAPI`
