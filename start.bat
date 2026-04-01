@echo off
title 30天教程 - Claude Code
cd /d "%~dp0"

echo.
echo ========================================
echo   30天从零构建 Claude Code - 互动教程
echo ========================================
echo.

if not exist "node_modules" (
    echo [1/2] 正在安装依赖（首次运行）...
    call npm install
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败，请确保已安装 Node.js 18+
        echo 下载地址: https://nodejs.org
        pause
        exit /b 1
    )
)

echo [2/2] 启动教程网站...
echo.
echo ========================================
echo   浏览器即将打开 http://localhost:3000
echo   按 Ctrl+C 可停止服务
echo ========================================
echo.

start http://localhost:3000
npm run dev
