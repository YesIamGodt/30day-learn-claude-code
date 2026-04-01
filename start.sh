#!/bin/bash
cd "$(dirname "$0")"

echo ""
echo "========================================"
echo "  30天从零构建 Claude Code - 互动教程"
echo "========================================"
echo ""

if [ ! -d "node_modules" ]; then
    echo "[1/2] 正在安装依赖（首次运行）..."
    npm install
fi

echo "[2/2] 启动教程网站..."
echo ""
echo "========================================"
echo "  浏览器即将打开 http://localhost:3000"
echo "  按 Ctrl+C 可停止服务"
echo "========================================"
echo ""

npm run dev
