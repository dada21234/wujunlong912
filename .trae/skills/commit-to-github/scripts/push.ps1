param(
    [string]$Message = "Update"
)

# Commit and push this project to GitHub via SSH (ASCII only for PS 5.1 compatibility)
$ErrorActionPreference = "Stop"
$repoUrl = "git@github.com:dada21234/wujunlong912.git"
# scripts -> commit-to-github -> skills -> .trae -> project root
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path
Set-Location $root

# Auto-accept github.com host key on first connection
$env:GIT_SSH_COMMAND = "ssh -o StrictHostKeyChecking=accept-new"

# 1. Init repo if missing, default branch main
if (-not (Test-Path (Join-Path $root ".git"))) {
    git init -b main
    if ($LASTEXITCODE -ne 0) {
        git init
        git checkout -B main
    }
}

# 2. Configure origin remote (update URL if it already exists)
git remote add origin $repoUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote set-url origin $repoUrl
}

# 3. Stage all changes
git add -A

# 4. Commit only when there are staged changes
$status = git status --porcelain
if ($status) {
    git commit -m $Message
}
else {
    Write-Host "Nothing to commit."
}

# 5. Push to main
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "Push OK: $repoUrl (main)"
}
