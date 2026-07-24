# AMY Desktop

> 基于 Electron + Nuxt 的桌面应用程序，使用 pnpm monorepo 架构管理。

## 🏗️ 项目结构

```
amy-desktop/
├── packages/
│   ├── main-process/        # Electron 主进程 (amy-main-process)
│   ├── renderer-process/    # 渲染进程 Nuxt 4 (@amy/renderer-process)
│   ├── shared/              # 共享库 (@amy/shared)
│   ├── zpublisher/          # Bitbucket 发布器 (@amy/publisher)
│   └── assets/              # 静态资源（图标、脚本）
├── .github/workflows/       # GitHub Actions CI/CD
├── .env.development         # 开发环境变量
├── .env.production          # 生产环境变量
├── pnpm-workspace.yaml      # pnpm workspace 配置
├── eslint.config.mts        # ESLint 配置 (flat config)
├── .prettierrc.json         # Prettier 配置
└── CLAUDE.md                # 开发指南
```

## 🛠️ 技术栈

| 包 | 核心技术 |
|---|---|
| `packages/main-process` | Electron 43, Electron Forge 7, Vite 5, TypeScript 5.7, Node 22 |
| `packages/renderer-process` | Nuxt 4.3, Vue 3, TypeScript 6 |
| `packages/shared` | TypeScript 5.6, Vitest 2 |
| `packages/zpublisher` | Electron Forge Publisher Base, TypeScript |
| `packages/assets` | 图标资源 (ICO/ICNS/PNG/SVG)，Python 图标生成脚本 |

### 其他核心依赖

- **包管理器**: pnpm@9.15.4
- **代码检查**: ESLint 10 (flat config) + Prettier 3.9
- **打包与发布**: Electron Forge + Bitbucket Publisher
- **支持的安装包格式**: Squirrel (Windows)、ZIP (macOS)、RPM / DEB (Linux)

## 📦 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 并行启动所有包的开发服务
pnpm dev

# 或单独启动
cd packages/main-process && pnpm dev
cd packages/renderer-process && pnpm dev
```

### 构建与打包

```bash
# 构建所有包
pnpm build

# 打包桌面应用
pnpm package

# 制作安装包
pnpm make

# 发布
pnpm publish
```

### 代码检查

```bash
# 类型检查
pnpm typecheck

# ESLint 检查
pnpm lint
```

## 📦 包说明

### main-process (`amy-main-process`)

Electron 主进程，负责窗口管理、系统交互和构建打包。

- **入口**: `src/main.ts` 和 `src/preload/preload.ts`
- **构建工具**: Electron Forge + Vite
- **安全加固**: 使用 `@electron/fuses` 进行安全配置

### renderer-process (`@amy/renderer-process`)

基于 Nuxt 4 的渲染进程，负责用户界面。

- **开发服务器**: Nuxt Dev Server
- **构建**: Nuxt Generate（生成静态文件供主进程加载）
- **环境配置**: 通过 `.env.*` 文件管理不同环境的配置

### shared (`@amy/shared`)

主进程和渲染进程共享的 TypeScript 工具库和类型定义。

### publisher (`@amy/publisher`)

自定义 Electron Forge 发布器，用于将构建产物发布到 Bitbucket。

- 基于 `@electron-forge/publisher-base` 扩展
- 在 `forge.config.ts` 中通过 `publishers` 配置启用

### assets

静态资源目录，包含应用图标和辅助脚本。

- 多尺寸图标：16×16 至 1024×1024，以及 `favicon.ico` / `favicon.icns`
- SVG 源文件：`logo.svg`、`logo-base.svg`
- 图标转换脚本：`svg2png.py`（依赖 cairosvg + Pillow）

## ⚙️ 环境变量

| 变量 | 说明 | 示例 |
|---|---|---|
| `APP_NAME` | 应用名称 | `AMY STATIONS` (生产) / `AMY_DEV` (开发) |

环境配置文件：

- `.env.development` — 开发环境
- `.env.production` — 生产环境

## 🔄 CI/CD

项目使用 GitHub Actions 进行持续集成，工作流文件位于 `.github/workflows/package.yml`。

- **触发条件**: 推送到 `main` 分支或手动触发
- **运行环境**: Windows
- **步骤**: 安装 pnpm → 安装依赖 → 构建并打包 → 上传构建产物

## 🔒 安全配置

应用在打包时通过 `@electron/fuses` 启用了以下安全选项：

- 禁用 `RunAsNode`
- 启用 Cookie 加密
- 禁用 Node.js 选项环境变量
- 禁用 Node CLI 调试参数
- 启用嵌入 ASAR 完整性验证
- 仅从 ASAR 加载应用

## 📄 许可证

ISC License

## 👤 作者

Liu Yuanshen
