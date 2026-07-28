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

1. **环境检查**
   - 确认当前目录是 Git 仓库：`git rev-parse --git-dir`
   - 检查工作区状态：`git status --porcelain`，如有未提交变更则提示并终止。
   - 确认远程仓库 origin 存在：`git remote get-url origin`

2. **切换到 master 并同步**
   - 记录当前分支名：`git branch --show-current`
   - 如果不在 master，执行 `git checkout master`；若无本地 master，则从 origin 拉取：`git checkout -b master origin/master`
   - 拉取最新代码：`git pull origin master`（失败则提示用户处理并退出）

3. **创建标签**
   - 若 `message` 不为空，创建附注标签：
     ```bash
     git tag -a {{tag_name}} -m "{{message}}"
     ```
