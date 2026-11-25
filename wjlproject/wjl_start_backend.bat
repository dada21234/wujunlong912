@echo off
chcp 936 >nul
rem 姓名：wujunlong    学号：24001010912
rem 时间：2026-11-19    大模型：DeepSeek-V4.1-Flash
rem 说明：一键启动后端服务（Node.js + Express），监听端口 8912。
title WJL Backend - Port 8912
cd /d "%~dp0backend"

if not exist node_modules (
    echo [wjl] 未检测到依赖，正在安装...
    call npm install
)

echo [wjl] 启动后端服务：http://localhost:8912
echo [wjl] 首页地址：http://localhost:8912/index.html
call npm start

echo.
echo [wjl] 服务已停止，按任意键退出...
pause >nul
