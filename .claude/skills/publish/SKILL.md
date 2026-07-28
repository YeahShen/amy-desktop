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
  message:
    type: string
    description: 标签的注释信息（可选，不填则创建轻量标签）
    required: false
---

## 执行流程

### 1. 环境检查

- 确认当前目录是 Git 仓库：`git rev-parse --git-dir`
- 检查工作区状态：`git status --porcelain`
- 确认远程仓库 origin 存在：`git remote get-url origin`

### 2. 处理未提交变更

如果工作区有未提交的变更：

1. 先检查 `package.json` 中的 `version` 字段是否与 `tag_name`（去掉 `v` 前缀）一致
2. 如果不一致，自动更新 `package.json` 的 `version` 字段
3. 执行提交和推送：
   ```bash
   git add -A
   git commit -m "chore: bump version to {{version}}"
   git push
   ```
4. 如果版本号已经一致，但有其他未提交变更，提示用户先处理（手动提交或暂存）

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

3. 创建新标签：
   - 若 `message` 不为空，创建附注标签：
     ```bash
     git tag -a {{tag_name}} -m "{{message}}"
     ```
   - 若 `message` 为空，创建附注标签（以 tag_name 作为默认注释）：
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
- 版本号: 0.0.2 (已同步 package.json)
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

1. 发布前会自动同步 `package.json` 中的 `version` 字段与标签版本号
2. 标签名称必须符合 `v*` 格式（如 v1.0.0），才能触发 GitHub Actions 发布工作流
3. 标签推送后，CI 会自动执行 `pnpm run publish`，需要 `AMY_PUBLISH_USERNAME` 和 `AMY_PUBLISH_PASSWORD` secrets 已配置
4. 不要在非 master 分支上执行此操作
