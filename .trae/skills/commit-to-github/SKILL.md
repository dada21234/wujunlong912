---
name: commit-to-github
description: Commit the gaojiwangye project and push it to the GitHub repo dada21234/wujunlong912 over SSH using the local id_ed25519 key. Use when the user asks to 提交到github, push到github, 同步到github, or commit and push this project. Do not use for other repositories or local-only commits.
---

# Commit to GitHub

将本项目（e:\gaojiwangye）提交 commit 并 push 到 GitHub 远程仓库，SSH 认证使用本机已生成的 `~/.ssh/id_ed25519` 密钥对。

## 目标仓库

- 远程地址（SSH）：`git@github.com:dada21234/wujunlong912.git`
- 分支：`main`

## 步骤

1. 运行 [push.ps1](scripts/push.ps1)，第一个参数为 commit 信息（默认 "Update"）：

   ```powershell
   powershell -ExecutionPolicy Bypass -File .trae/skills/commit-to-github/scripts/push.ps1 -Message "提交说明"
   ```

   脚本自动完成：git init（如无仓库，默认分支 main）、设置 origin 远程、`git add -A`、commit（仅有变更时）、`git push -u origin main`。

2. 若推送被拒绝（远程已有提交），先执行 `git pull --rebase origin main` 再推送；出现冲突时报告用户，不要强推。
3. 若提示 `Permission denied (publickey)`，说明公钥尚未添加到 GitHub 账号，提示用户把 `C:\Users\殇\.ssh\id_ed25519.pub` 的内容添加到 GitHub 的 SSH Keys 设置中。
4. 推送成功后，用 `git log --oneline -3` 和 `git status` 验证并汇报结果。
