# CLAUDE.md

This is an Electron desktop app monorepo using pnpm workspaces.

## Project Structure

```
amy-desktop/
├── packages/
│   ├── main-process/        # Electron 主进程 (Node.js + Electron Forge + Vite)
│   ├── renderer-process/    # 渲染进程 (Nuxt 4 + Vue + AntDV Next + Tailwind CSS)
│   ├── shared/              # 共享库 (@amy/shared, TypeScript + Vitest)
│   └── zpublisher/          # 自定义发布器 (@amy/publisher, Electron Forge Publisher)
├── .github/workflows/       # CI/CD (package.yml + publish.yml)
├── .claude/                 # Claude Code 配置（skills: gitpush/publish）
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
│   │   ├── preload.ts       # contextBridge 暴露 window.electronAPI（send/on/invoke/getSetting/setSetting/getPathForFile/closeDialog）
│   │   └── tsconfig.json    # Preload 专用 TS 配置（CommonJS, DOM+ESNext）
│   ├── ipc-event/
│   │   ├── index.ts         # 汇总入口（import handle/send/on）
│   │   ├── channels.ts      # 通道定义：ON_EVENT(11) / HANDLE_EVENT(5) / SEND_EVENT(1)
│   │   ├── on.ts            # ipcMain.on：login、open-dev-tools、set-ignore-mouse-events、set-window-position、
│   │   │                    #   窗口控制（close/hid/min/max/restore）、set-setting、set-user-info
│   │   ├── send.ts          # 空文件（主→渲染推送由各窗口直接 webContents.send，如 home.ts 的 WINDOW_SIZE_STATE）
│   │   └── handle.ts        # ipcMain.handle：get-screen-rect、get-window-position、get-setting、
│   │                        #   open-dialog（动态弹窗 + close_dialog:{id} 回调释放）、get-user-detail
│   ├── server/
│   │   ├── index.ts         # 内置 Koa 服务器（打包态）：/api、/resource/* 代理到后端
│   │   │                    # （自动附加 Bearer token + X_PLATFORM: client），brotli 静态托管，/local 读图
│   │   └── send/
│   │       ├── index.ts     # koa-send 实现（brotli 压缩 + cheerio HTML color-mode 注入）
│   │       ├── serve.ts     # koa-static 风格中间件
│   │       └── type.ts      # SendOptions 类型定义
│   ├── stores/
│   │   ├── auth.ts          # 认证状态（electron-store 'amy-auth'，token + User + restart 标记）
│   │   ├── app-settings.ts  # 应用设置（electron-store 'amy-setting'，默认值走 schema default，经 @amy/shared appSettingBuilder 读写）
│   │   └── runtime-config.ts# 运行时配置（electron-store 'runtime-config'：主窗口尺寸、悬浮窗位置）
│   ├── windows/
│   │   ├── login.ts         # 登录窗口（360×440，无边框）
│   │   ├── home.ts          # 主窗口（尺寸持久化，maximize/unmaximize 推送 WINDOW_SIZE_STATE，关闭即退出）
│   │   ├── float.ts         # 悬浮窗（透明 + 置顶 + skipTaskbar + 位置持久化）
│   │   └── dialog.ts        # createDialogWindow — 弹窗窗口（居中于父窗口、modal 阻塞，支持 onTop 置顶；
│   │                        #   open-dialog invoke 返回 Promise，close_dialog:{id} 关闭并释放监听）
│   ├── utils/
│   │   ├── constants.ts     # HTML_URL、HOME_WINDOW_BASE_SIZE、RESOURCE_PATH、DEFAULT_FONT_TYPE
│   │   ├── window.ts        # createFrameWindow / buildWindowUrl（frame: false, contextIsolation: true）
│   │   ├── tray.ts          # 系统托盘（Win 左键切换主窗口显隐；仅登录成功后创建）
│   │   ├── color-mode.ts    # initColorMode / getColorModel / isDark（把 store 偏好解析为最终主题写入 cookie --amy-color-mode）
│   │   ├── full-screen.ts   # koffi 原生调用全屏检测（Windows：SHQueryUserNotificationState + 前台窗口矩形）
│   │   ├── font-installer.ts# installFont — 系统字体安装（仅 .ttf；Windows 用户字体目录+注册表+AddFontResourceW；Linux XDG+fc-cache；幂等跳过）
│   │   ├── squirrel.ts      # Squirrel 安装事件处理（安装/更新时装默认字体 + 创建快捷方式，处理完无条件退出）
│   │   ├── check-ipv6.ts    # IPv6 探测（ipv6.icanhazip.com，3s 超时）
│   │   └── send.utils.ts    # isPathExists / isPathHidden / getFileType
│   ├── __test__/            # Vitest 单元测试
│   │   └── font-installer.test.ts # installFont 全链路测试（mock reg/koffi/electron，构造最小 TTF）
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
├── vitest.config.ts         # Vitest 测试配置（globals, src/**/*.test.ts）
├── forge.config.ts          # Electron Forge 配置（Squirrel/ZIP/Deb/Rpm、Fuses、extraResource 含 fonts、@amy/publisher）
├── .eslintrc-auto-import.json # 自动生成：ESLint auto-import globals 声明
└── tsconfig.json            # 扩展 @tsconfig/node22
```

### Renderer Process (`packages/renderer-process`)

```
renderer-process/
├── src/
│   ├── app.vue              # Nuxt 根组件（F12 → open-dev-tools IPC；a-config-provider 注入 AntDV 主题
│   │                        #   token colorPrimary #28a17c + dark/light algorithm，a-app 包裹）
│   ├── pages/
│   │   ├── login.vue        # 登录页（empty 布局，强制暗色 colorMode: 'dark'，jsencrypt RSA 密码加密 + $request 登录；
│   │   │                    #   底部扫码登录/更多选项入口）
│   │   ├── home.vue         # 主页（空壳，workspace: 'home'）
│   │   ├── film.vue         # 影视页（空壳）
│   │   ├── photograph.vue   # 摄影页（空壳）
│   │   ├── artist.vue       # 艺术家页（空壳）
│   │   ├── settings.vue     # 设置页（dialog 布局，当前为空壳占位）
│   │   └── float.vue        # 悬浮窗页（empty 布局 + 透明背景，折叠圆形按钮/展开菜单 + 拖动 + 鼠标穿透；
│   │                        #   Logo 配色用 useColorMode，菜单用 i-lucide-* 图标）
│   ├── layouts/
│   │   ├── default.vue      # 默认布局（Sidebar + Navbar + MainContent）
│   │   ├── empty.vue        # 空白布局（用于登录/悬浮窗）
│   │   └── dialog.vue       # 弹窗布局（设置等 dialog 页，当前为空壳）
│   ├── components/
│   │   ├── amy/             # 通用组件：Logo、Scrollbar、SwitchColorMode
│   │   │   └── window/      # 窗口控制按钮（Close / MinSize / MaxSize-最大化还原）
│   │   ├── layout/          # 布局组件（Navbar、Sidebar、MainContent、Search）
│   │   └── login/           # 登录页组件（Header、Usernamepassword）
│   ├── composables/
│   │   ├── useRequest.ts    # $request / useRequest — 基于 Nuxt $fetch/useFetch 的请求封装
│   │   ├── useMessage.ts    # 全局消息提示（自研 antd 风格 API：success/error/info/warning/loading/open/destroy/config）
│   │   ├── useSettings.ts   # 应用设置读写（基于 electronAPI getSetting/setSetting + watch 回写）
│   │   ├── useColorMode.ts  # 颜色模式读写（cookie --amy-color-mode + 切换时应用 <html> class + setSetting 持久化）
│   │   └── useDialog.ts     # openDialog / useDialog — 弹窗窗口控制（基于 open-dialog IPC + closeDialog 回调）
│   ├── plugins/
│   │   ├── request.ts       # $request 插件（$fetch 实例，mock 模式走 /mock/api，否则 /api）
│   │   └── color-mode.server.ts # 页面级强制主题：把 definePageMeta({ colorMode }) 注入 html 的 data-color-mode-forced 属性
│   ├── stores/
│   │   ├── app.ts           # Pinia appStore（searchActive + showNavbarLeftContent 派生）
│   │   └── user.ts          # Pinia userStore（token/info + updateUserInfo，经 get-user-detail / set-user-info IPC 同步）
│   └── assets/
│       ├── css/
│       │   ├── main.css     # 全局 body/html 样式（高度 100%、overflow: hidden、user-select: none；body 用系统 PingFangSC）
│       │   ├── tailwind.css # Tailwind CSS v4 导入层（@antdv-next/tailwind theme + @custom-variant dark +
│       │   │                #   @theme 语义色映射 + drag/no-drag utilities）
│       │   ├── themes.css   # 主题系统（--ui-* 语义色变量映射 AntDV token + --sidebar-width/--navbar-height）
│       │   └── fonts.css    # 仅 Orbitron 走 woff2 内嵌；PingFangSC 等由主进程安装为系统字体
│       ├── icons/           # amy 自定义图标集合（Nuxt Icon custom 前缀，21 个 svg）
│       └── fonts/           # Orbitron.woff2（仅保留标题字体）
├── shared/
│   ├── electron-types.d.ts  # Window.electronAPI 全局类型声明（IPC、设置、文件操作）
│   └── page.d.ts            # 页面元数据扩展（workspace、colorMode、sidebarMode、immersiveSidebar、dialog、requiresAuth）
├── server/                  # Nuxt Nitro 服务端
│   ├── middleware/
│   │   ├── api-proxy.ts     # /api/* 请求代理到后端（读 .nuxt/_auth_token 附加 Bearer + X_PLATFORM）
│   │   └── static-resource-proxy.ts # /resource/* 静态资源代理
│   ├── routes/
│   │   ├── set-token.ts     # Token 写入路由（?token=xxx 写入 .nuxt/_auth_token，dev/mock 模式用）
│   │   └── mock/            # Mock 接口（AMY_MODE=mock 时使用）
│   │       ├── api/auth/login-by-username-password.post.ts # 模拟登录接口
│   │       ├── api/user/update-info.ts                     # 用户资料更新（空实现占位）
│   │       └── resource/user-avatar.ts                     # 模拟用户头像资源
│   └── plugins/
│       └── html-transform.ts # Nitro HTML 钩子，开发模式读 cookie 注入 color-mode class/style（防 FOUC）
├── nuxt.config.ts           # Nuxt 配置（srcDir, modules 含 @antdv-next/nuxt, css, runtimeConfig, nitro brotli,
│                            #   amy 图标集合, antd.icon:false, body font-family, 原生 pageTransition）
└── tsconfig.json            # 引用 .nuxt 自动生成的 tsconfig
```

### Shared (`packages/shared`)

```
shared/src/
├── index.ts                 # 统一导出入口（另导出 ./favicon.ico、./utils/color-mode 子路径）
├── utils/
│   ├── auth-axios.ts        # createAuthAxios — 带认证拦截器的 Axios 实例（60s 超时）
│   ├── track-promise.ts     # createTrackedPromise — 可同步查询状态/值/原因的 Promise
│   ├── task-scheduler.ts    # TaskScheduler — 并发任务调度器（重试 + 进度回调 + 事件）
│   ├── file.ts              # fileChunk / fileStat / getFileSize / getFileTotalChunks — 文件分块
│   ├── upload-file.ts       # createUploadFileFn — 文件分块上传封装（form-data）
│   ├── zip.ts               # makeZip — ZIP 压缩（archiver，level 9；⚠ Node 专属，渲染进程勿从 barrel 导入）
│   ├── tools.ts             # Flatten / UnionToIntersection 类型工具
│   ├── user.ts              # User / UserloggedCacheItem 接口定义
│   ├── app-settings.ts      # AppSettings 类型（login/proxy/colorMode/hideHomeWindowOrExit/appRunSettings）+ appSettingBuilder（读写器工厂）
│   ├── color-mode.ts        # getColorModeCookie() — 返回 --amy-color-mode 键名（单一事实来源）
│   └── common-dialog.ts     # 弹窗窗口类型定义（Bounding 等，经 barrel 导出）
├── __test__/                # Vitest 单元测试
│   ├── auth-axios.test.ts
│   ├── file.test.ts
│   ├── track-promise.test.ts
│   └── task-scheduler.test.ts
└── assets/                  # 图标 & 脚本资源
    ├── icon/                # 应用图标（favicon.ico/icns/png 多尺寸 + logo svg）
    ├── fonts/               # 系统字体（PingFangSC-Medium/Regular.ttf，打包后经 extraResource 分发，安装时注册到系统）
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
| `packages/renderer-process` | Nuxt 4.3, Vue 3, TypeScript 6, antdv-next 1.5 + @antdv-next/{nuxt,tailwind,icons}, Tailwind CSS 4.3, Pinia, VueUse 14, sass-embedded |
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
cd packages/main-process && pnpm test    # 运行 Vitest 测试（font-installer 等）
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
- **`@amy/shared` exports raw TypeScript source** (`"exports": {".": "./src/index.ts", "./utils/color-mode": "./src/utils/color-mode.ts"}`) — not compiled JS, consuming packages resolve it at build time
- ⚠️ **渲染进程（浏览器）值导入只用子路径**（如 `@amy/shared/utils/color-mode`），不要从 barrel 值导入——barrel 含 `zip.ts`（archiver）等 Node 专属依赖，会打进浏览器 bundle 导致 `util.inherits is not a function` 崩溃
- ✅ **type-only 导入（`import type`）可从 barrel 安全引入**类型（`Bounding`、`User`、`AppSettings` 等），编译期即擦除，不进运行时 bundle（useDialog/userStore/electron-types 均如此）

### Electron
- Uses Electron Forge 7 for packaging/building; main entry `src/main.ts`
- `@electron-forge/plugin-vite` with separate Vite configs for main and preload
- `@electron/fuses` 安全加固：RunAsNode 禁用、cookie 加密、Node options/cli inspect 禁用、Asar 完整性校验、OnlyLoadAppFromAsar
- 自定义发布器（`@amy/publisher`）分块上传产物到 `https://release.ashen-station.top`（credentials in `AMY_PUBLISH_USERNAME` / `AMY_PUBLISH_PASSWORD`）
- 多窗口架构：登录窗口（login）、主窗口（home）、浮动窗口（float）、弹窗窗口（dialog，经 `openDialog` IPC 动态创建）
- 内置 Koa 服务器（`server/index.ts`）在**打包态**启动：代理 `/api`、`/resource` 到 `AMY_BASE_URL`（自动附加 Bearer token + `X_PLATFORM: client`），brotli 托管 Nuxt 静态产物，`/local?path=` 读任意图片；`send/index.ts` serve HTML 时 cheerio 注入主题 class（生产 FOUC 防护，见 Renderer 颜色模式）
- **Preload 已实现**：`window.electronAPI` 暴露 `send(channel, ...args)` / `on(channel, fn)` / `invoke(channel, ...args)` / `getSetting` / `setSetting` / `getPathForFile`（webUtils）/ `closeDialog`（发 `close_dialog:{id}` 通道）（对应类型声明见 renderer `shared/electron-types.d.ts`）
- IPC 通道（`ipc-event/channels.ts`）：`ON_EVENT` = login、open-dev-tools、set-ignore-mouse-events、set-window-position、close/hid/min/max/restore-window、set-setting、set-user-info；`HANDLE_EVENT` = get-screen-rect、get-window-position、get-setting、open-dialog、get-user-detail；`SEND_EVENT` = window-size-state（主→渲染推送，home.ts 直接 webContents.send）；另含动态通道 `close_dialog:{id}` 回传弹窗结果
- **登录流程**：渲染进程 jsencrypt RSA 加密密码 → `POST /auth/login-by-username-password` → `electronAPI.send('login', token, user)` → 主进程 `setAuthenticate` + 创建主窗口 + 关闭登录窗 +（若 `appRunSettings.showFloatWindow`）创建悬浮窗；主窗口 `userStore` 经 `get-user-detail` 拉取 token/用户信息，`set-user-info` 回写
- **字体安装体系**：字体资源（PingFangSC ttf）在 `shared/src/assets/fonts/`，打包为 extraResource（`resources/fonts`）；Squirrel 安装/更新事件调用 `installFont(DEFAULT_FONT_TYPE)` 注册到系统（Windows 用户字体目录 + HKCU 注册表 + AddFontResourceW；Linux XDG + fc-cache）；渲染进程通过系统字体名 `PingFangSC` 直接使用，仅 Orbitron 内嵌 woff2
- **Squirrel 事件**：install/updated/uninstall 处理完**无条件 `app.quit()`**（防止安装器动画期间打开应用窗口）；字体安装失败仅告警不阻断流程
- Token 持久化：主进程 electron-store `'amy-auth'`；dev/mock 模式另经 Nitro `set-token` 路由写入 `.nuxt/_auth_token` 供开发代理使用
- `unplugin-auto-import` 自动导入 `src/utils`、`src/windows`、`src/stores`、`src/ipc-event` 中的导出，类型生成至 `types/main-process-autoimport.d.ts`
- `vite.main.config.ts` 将 `AMY_` 前缀环境变量转为 `define` 全局常量，并生成 `types/define.d.ts` 类型声明
- 系统托盘：登录成功后创建，Win 左键单击切换主窗口显隐，菜单含"显示主窗口/退出"
- 全屏检测：koffi 调用 `SHQueryUserNotificationState` + 前台窗口矩形比对（仅 Windows 生效），每 1s 轮询以隐藏/显示悬浮窗
- 更新：StaticStorage 更新源（`AMY_UPGRADE_URL`，IPv6 可达时用 `AMY_UPGRADE_IPV6_URL`），baseUrl 拼 `${platform}/${arch}`

### Renderer (Nuxt)
- **AntDV Next + Tailwind CSS 4** — UI 组件库（`@antdv-next/nuxt` 模块自动注册组件：小写 `a-*` 标签如 a-avatar/a-divider，或大写 `A*` 组件如 AButton）；主题在 `app.vue` 用 `a-config-provider` 注入（`colorPrimary: #28a17c`，`theme.darkAlgorithm` / `theme.defaultAlgorithm` 跟随颜色模式），`a-app` 包裹；语义色 token 通过 `themes.css` 的 `--ui-*` CSS 变量（映射 AntDV token）+ `tailwind.css` 的 `@theme` 映射（`text-muted`/`bg-elevated`/`border-default` 等 Tailwind 类）；`tailwind.css` 引入 `@antdv-next/tailwind/theme.css` 与 `@custom-variant dark`，并定义 `drag`/`no-drag` 窗口拖拽 utilities
- ⚠️ **编辑涉及 antdv-next 组件（`a-*` 小写或 `A*` 大写前缀，如 a-avatar/a-divider/AButton）的代码前，先参考根目录 `/llms-full.txt`**（AntDV Next 完整文档/类型参考）确认组件的 props/slots/API，不要凭记忆写组件用法
- **颜色模式（自研，不依赖第三方 color-mode 模块）**：
  - 单一 cookie `--amy-color-mode`，键名由 `@amy/shared` `getColorModeCookie()` 提供（单一事实来源，避免多端漂移）
  - 主进程 `initColorMode()` 启动时把 store 的 `colorMode` 设置（'dark'|'light'|'system'，'system' 经 `nativeTheme.shouldUseDarkColors` 解析为具体主题）写入 cookie（10 天过期）
  - **生产 FOUC 防护**：主进程 Koa `server/send/index.ts` serve HTML 时用 cheerio 注入 `<html class>` + `color-scheme`（页面有 `data-color-mode-forced` 属性则优先，否则用 `getColorModel()`）
  - **开发 FOUC 防护**：Nitro `server/plugins/html-transform.ts` 读 cookie 注入 class
  - **页面级强制主题**：`plugins/color-mode.server.ts` 把 `definePageMeta({ colorMode })` 注入为 html 的 `data-color-mode-forced` 属性（如 login.vue 强制暗色）
  - **客户端**：`composables/useColorMode.ts` 读写 cookie（`useCookie`）、`toggleMode()` 同步 `<html>` class + color-scheme 并 `setSetting('colorMode')` 持久化；`SwitchColorMode.vue`（View Transitions 圆形扩散）与 `float.vue`（Logo 配色）使用
- **Pinia** — 状态管理：`stores/app.ts`（searchActive + showNavbarLeftContent 派生）、`stores/user.ts`（token/info/updateUserInfo，IPC 同步）
- **VueUse** — 组合式工具集（useElementSize、useLocalStorage、onClickOutside 等）
- **Nuxt Icon 自定义集合** — `amy` 前缀，路径 `src/assets/icons/`（21 个 svg：home-2-bold、videocamera-add-bold、photo、cup-star-bold-duotone、cloud-check-broken、settings-line-duotone、settings-bold-duotone、shield-user-bold、bag-heart-bold-duotone、user-outlined、lock-outlined、eye/eye-off、minus、window-close、full-screen、restore、moon/sun、search、logo-base）；lucide 前缀用于通用图标
- 请求封装：`plugins/request.ts` 提供 `$request`（$fetch 实例），按 `AMY_MODE` 决定 baseURL（`mock` → `/mock/api`，否则 `/api`）；400 响应抛出 `createError`；`composables/useRequest.ts` 提供 `$request`/`useRequest` 封装
- **Mock 模式**（`pnpm dev:mock`，`.env.mock`）：请求走 Nitro `server/routes/mock/` 模拟接口，无需启动后端
- 应用设置：`composables/useSettings(key)` 通过 `window.electronAPI.getSetting/setSetting` 读写主进程 electron-store（'amy-setting'），watch 变化自动回写；键类型由 `@amy/shared` 的 `AppSettings` + `Flatten` 推导（login/proxy/colorMode/hideHomeWindowOrExit/appRunSettings.showFloatWindow）
- 布局组件：`components/layout/`（Navbar、Sidebar、MainContent、Search），默认布局由四者组合；侧边栏菜单（home/film/photograph/artist）以页面 `workspace` meta 驱动高亮，`sidebarMode` 支持毛玻璃（frosted → apple-glass）/沉浸式；Navbar 含用户头像 + 最小化/最大化还原/关闭 三窗口按钮（MaxSize 监听 `window-size-state` 推送切换图标）；Search 搜索框点击展开居中，经 `appStore.searchActive` 联动导航栏左侧标题显隐
- 悬浮窗（`pages/float.vue`）：折叠圆形 Logo 按钮 + 呼吸光晕，展开菜单（搜索/笔记/任务/设置），基于 `set-ignore-mouse-events` 实现鼠标穿透，拖拽移动窗口并持久化位置
- 页面级元数据（`definePageMeta`）：`workspace`（'home'|'film'|'photograph'|'artist'）、`colorMode`、`sidebarMode`（'immersive'|'default'|'frosted'）、`immersiveSidebar`、`dialog`（DialogMeta）、`requiresAuth`
- 字体策略：正文用系统安装的 `PingFangSC`（Squirrel 安装时注册，见主进程字体安装体系）；仅标题字体 Orbitron 内嵌 woff2（fonts.css）

### Testing
- `packages/shared` uses Vitest 2 — tests in `src/__test__/`（auth-axios / file / track-promise / task-scheduler）
- `packages/main-process` uses Vitest 2 — tests in `src/__test__/`（font-installer：mock child_process/electron/koffi + 构造最小 TTF 全链路验证）
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

- **Do not manually edit** `packages/renderer-process/.nuxt/`、`.output/` — auto-generated by Nuxt（已 .gitignore 不入库）
- **Do not manually edit** `packages/main-process/out/`、`.vite/`、`types/define.d.ts`、`types/main-process-autoimport.d.ts`、`.eslintrc-auto-import.json` — 构建/插件自动生成（`types/define.d.ts`、`*autoimport.d.ts` 已 .gitignore 不入库；`.eslintrc-auto-import.json` 仍被追踪）
- `*.mts` files are TypeScript modules (ESM) — used for ESLint config and similar
- Type declaration files in `types/**/*.d.ts` per package
- Assets 分布：`packages/shared/src/assets/`（icon / fonts / koffi scripts，打包 extraResource）、`packages/renderer-process/src/assets/`（css / icons / fonts-Orbitron）
- Renderer shared types (`packages/renderer-process/shared/`) — Nuxt 类型声明扩展（electronAPI、PageMeta），不参与构建产物
- 模板字符串风格的 IPC 通道：preload 的 `electronAPI` 类型从主进程 `channels.ts` 导入，渲染进程通过 `shared/electron-types.d.ts` 声明全局 `Window.electronAPI`
