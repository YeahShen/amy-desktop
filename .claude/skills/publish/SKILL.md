---
name: publish
description: 切换到 master 分支，拉取最新代码，创建 Git 标签并推送到远程仓库。
triggers:
  - 在 master 上打 tag
  - 给 master 打标签
  - 在 master 分支打一个标签并推送
  - 发布版本 tag
parameters:
  tag_name:
    type: string
    description: 要创建的标签名称，例如 v1.0.0
    required: true
---

## 执行流程

### 1. 环境检查

- 确认当前目录是 Git 仓库：`git rev-parse --git-dir`
- 检查工作区状态：`git status --porcelain`
- 确认远程仓库 origin 存在：`git remote get-url origin`

### 2. 同步版本号

发布前需要同步以下两个文件的 `version` 字段，确保它们与 `tag_name`（去掉 `v` 前缀）一致：

- `package.json` — 根包版本号
- `packages/main-process/package.json` — Electron 主进程包版本号（Electron Forge publish 实际使用此版本）

执行逻辑：

1. 逐个检查两个文件的 `version` 字段是否为 `{{version}}`
2. 将不一致的文件更新为 `{{version}}`
3. 无论之前是否有未提交变更，版本号更新后统一提交：
   ```bash
   git add -A
   git commit -m "chore: bump version to {{version}}"
   git push
   ```
4. 如果两个文件的版本号都已一致，但有其他未提交变更，提示用户先处理（手动提交或暂存）
5. 如果版本号已一致且工作区干净，跳过此步骤

### 3. 切换到 master 并同步

- 记录当前分支名：`git branch --show-current`
- 如果不在 master，执行 `git checkout master`；若无本地 master，则从 origin 拉取：`git checkout -b master origin/master`
- 拉取最新代码：`git pull origin master`（失败则提示用户处理并退出）

### 4. 创建标签

1. 先检查标签是否已存在：

   ```bash
   git tag -l {{tag_name}}
   git ls-remote --tags origin {{tag_name}}
   ```

2. 若标签已存在，先删除本地和远程标签：

   ```bash
   git tag -d {{tag_name}}
   git push origin --delete {{tag_name}}
   ```

   删除成功后输出提示：`⚠ 已删除已存在的标签 {{tag_name}}（本地 + 远程）`

3. 自动生成 tag message — 收集上一 tag 到 HEAD 之间的提交记录：

   a. 获取上一个 tag：

   ```bash
   # 尝试从本地获取最新的 v* 标签
   git describe --tags --abbrev=0 --match "v*" 2>/dev/null
   # 如果本地没有，从远程拉取
   git fetch --tags origin 2>/dev/null
   # 再次尝试获取
   git describe --tags --abbrev=0 --match "v*" 2>/dev/null
   ```

   b. 获取两个版本之间的提交记录：

   ```bash
   git log {{上一个tag}}..HEAD --oneline --no-merges
   ```

   c. 提取关键信息，去掉 emoji 和 conventional commit 前缀（`feat:` `fix:` `chore:` `docs:` `refactor:` `style:` `test:` `perf:` `revert:` `ci:` `build:`），保留核心描述。

   d. 按序号格式化 tag message：

   ```
   1. 提交描述1
   2. 提交描述2
   3. ...
   ```

   排除版本号更新类提交（如 `chore: bump version to x.x.x`）。

4. 用生成的 message 创建附注标签：

   - 如果过滤后有有效的提交描述：
     ```bash
     git tag -a {{tag_name}} -m "{{生成的message}}"
     ```
   - 如果过滤后无有效提交（只有版本号更新等被排除的提交），不添加 message：
     ```bash
     git tag -a {{tag_name}} -m "{{tag_name}}"
     ```

### 5. 推送标签

```bash
git push origin {{tag_name}}
```

推送成功后，GitHub Actions 的 `publish.yml` 工作流将自动触发构建和发布。

## 输出格式

### 成功时

```
✓ 标签发布成功！

- 分支: master
- 标签: v0.0.2
- 版本号: 0.0.2 (已同步 package.json + packages/main-process/package.json)
- 提交: chore: bump version to 0.0.2
- 推送: 已完成
```

### 失败时

```
✗ 发布失败
原因: [具体错误信息]

可能的原因：
- 工作区有未提交的变更（非版本号相关）
- 未连接到远程仓库
- 远程仓库拒绝推送（权限问题或冲突）
- 网络连接失败
```

## 注意事项

1. 发布前会自动同步 `package.json` 和 `packages/main-process/package.json` 中的 `version` 字段与标签版本号
2. `packages/main-process/package.json` 的版本是 Electron Forge 实际使用的发布版本号，必须同步
3. 标签名称必须符合 `v*` 格式（如 v1.0.0），才能触发 GitHub Actions 发布工作流
4. 标签推送后，CI 会自动执行 `pnpm run publish`，需要 `AMY_PUBLISH_USERNAME` 和 `AMY_PUBLISH_PASSWORD` secrets 已配置
5. 不要在非 master 分支上执行此操作
