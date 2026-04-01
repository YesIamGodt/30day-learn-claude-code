# 《从零构建 Claude Code》互动教程网站

> 下载后双击即可学！内置代码编辑器，无需配置任何环境。

[![](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![](https://img.shields.io/badge/Next.js-14-blue.svg)](https://nextjs.org)

---

## 一键启动

### Windows 用户

**双击 `start.bat`**，浏览器自动打开，开始学习！

### Mac / Linux 用户

```bash
chmod +x start.sh
./start.sh
```

### 手动启动

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

---

## 功能特点

### 在线代码运行

每个教程页都带可运行的代码编辑器，无需复制粘贴：

- **本地模式**：浏览器内置 JS 引擎，即点即跑，秒级响应
- **WebContainer 模式**（需 Vercel 部署）：支持完整 Node.js API

### 30 天闯关地图

- 学习进度自动保存，刷新不丢失
- 每天打卡追踪完成状态
- 打卡后有庆祝动画

### AI 对话模拟器

- 模拟 Claude Code 的 REPL 交互流程
- 预置多个场景演示

---

## 目录结构

```
tutorial-site/
├── start.bat              # Windows 一键启动
├── start.sh              # Mac/Linux 一键启动
├── app/
│   ├── page.tsx              # 首页：闯关地图
│   ├── day/[n]/page.tsx    # 教程页（MDX 内容）
│   └── simulator/page.tsx   # AI 对话模拟器
├── components/
│   ├── DayCard.tsx          # 进度格（锁定/活跃/完成）
│   ├── CodeEditor.tsx       # Monaco 编辑器 + 双运行时
│   ├── ExerciseBlock.tsx    # 填空练习 + 验证反馈
│   ├── AnswerReveal.tsx     # 答案折叠展开
│   └── CheckInButton.tsx   # 打卡按钮 + confetti
├── content/days/
│   └── 01.md ~ 30.md      # 教程内容（JS/Node.js 版）
└── lib/
    ├── store.ts             # Zustand + localStorage 进度
    ├── exercises.ts         # 填空验证逻辑
    └── mdx.ts              # MDX 内容加载
```

---

## 代码运行说明

| 模式 | 适用场景 | 启动速度 | API 支持 |
|------|---------|---------|---------|
| 本地 JS | 纯 JS 逻辑演示 | 即时 | 浏览器标准 API |
| WebContainer | 需要 Node.js API | 3-5 秒 | 完整 Node.js |

---

## 相关项目

- **Python 版教程**：[../README.md](../README.md) — 用 Python 从零构建的 30 天教程
