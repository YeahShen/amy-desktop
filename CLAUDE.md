# CLAUDE.md

This is an Electron desktop app monorepo using pnpm workspaces.

## Project Structure

```
amy-desktop/
├── packages/
│   ├── main-process/        # Electron 主进程 (Node.js + Electron Forge + Vite)
│   ├── renderer-process/    # 渲染进程 (Nuxt 4 + Vue)
│   ├── shared/              # 共享库 (@amy/shared, TypeScript + Vitest)
│   └── zpublisher/          # 自定义发布器 (@amy/publisher, Electron Forge Publisher)
├── .github/workflows/       # CI/CD (package.yml + publish.yml)
├── .claude/                 # Claude Code 配置和技能
├── eslint.config.mts        # 根 ESLint flat config
├── pnpm-workspace.yaml      # pnpm workspace 定义
├── .prettierrc.json         # Prettier 配置
├── .npmrc                   # pnpm registry mirror 配置
├── tsconfig.base.json       # 根 TS 基础配置
├── .env.development         # 开发环境变量 (APP_NAME=AMY_DEV)
├── .env.production          # 生产环境变量 (APP_NAME='AMY STATIONS')
└── .vscode/settings.json    # VS Code 项目设置
```

### Main Process (`packages/main-process`)

```
main-process/
├── src/
│   ├── main.ts              # Electron 入口，创建 BrowserWindow
│   ├── preload/
│   │   ├── preload.ts       # Preload 脚本（空模板）
│   │   └── tsconfig.json    # Preload 专用 TS 配置（CommonJS, DOM+ESNext）
│   └── updater/
│       └── index.ts         # 应用更新模块（空模板）
├── types/
│   ├── define.d.ts          # 全局类型声明
│   └── forge.env.d.ts       # Electron Forge 环境类型
├── vite.main.config.ts      # Vite 主进程构建配置
├── vite.preload.config.ts   # Vite preload 构建配置
├── forge.config.ts          # Electron Forge 配置（打包/发布/签名）
└── tsconfig.json            # 扩展 @tsconfig/node22
```

### Renderer Process (`packages/renderer-process`)

```
renderer-process/
├── src/
│   └── app.vue              # Nuxt 根组件
├── nuxt.config.ts           # Nuxt 配置（srcDir: 'src', @nuxt/eslint）
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
│   └── zip.ts               # makeZip — ZIP 压缩
├── __test__/                # Vitest 单元测试
│   ├── auth-axios.test.ts
│   ├── file.test.ts
│   ├── track-promise.test.ts
│   └── task-scheduler.test.ts
└── assets/                  # 图标 & 脚本资源
    ├── icon/                # 应用图标（PNG/ICO/ICNS/SVG）
    └── scripts/             # svg2png.py 等辅助脚本
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
| `packages/main-process` | Electron 43, Electron Forge 7, Vite 5, TypeScript 5.7, Node 22 |
| `packages/renderer-process` | Nuxt 4.3, Vue 3, TypeScript 6, @nuxt/eslint |
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

### Electron
- Uses Electron Forge for packaging/building
- Main process entry is `packages/main-process/src/main.ts`
- Uses `@electron-forge/plugin-vite` with separate Vite configs for main and preload
- `@electron/fuses` for security hardening (RunAsNode disabled, Asar integrity, cookie encryption)
- Custom publisher (`@amy/publisher`) uploads artifacts to a Bitbucket-like release server with chunked upload + integrity check

### Testing
- `packages/shared` uses Vitest 2 — tests in `src/__test__/`
- `packages/zpublisher` uses Vitest 2 — tests in `src/__test__/`
- Run with `pnpm test` inside respective package directories

### Environment Variables
- `.env.development` — `APP_NAME=AMY_DEV`
- `.env.production` — `APP_NAME='AMY STATIONS'`
- Renderer dev/build uses `--dotenv ../../.env.{environment}` to load env
- Publisher credentials via `AMY_PUBLISH_USERNAME` / `AMY_PUBLISH_PASSWORD` (set in CI secrets)

### CI/CD (GitHub Actions)
- **package.yml** — triggered on push to `main`: builds Windows installer via `pnpm make`, uploads artifacts
- **publish.yml** — triggered on `v*` tag push: runs `pnpm publish` to deploy to release server
- Uses `pnpm/action-setup@v4`, Node 22, `--no-frozen-lockfile` for CI installs

## File Patterns

- **Do not manually edit** `packages/renderer-process/.nuxt/` or `.output/` — auto-generated by Nuxt
- `*.mts` files are TypeScript modules (ESM) — used for ESLint config and similar
- Type declaration files in `types/**/*.d.ts` per package
- Assets (icons, scripts) live in `packages/shared/src/assets/` — accessed via `@amy/shared` exports
