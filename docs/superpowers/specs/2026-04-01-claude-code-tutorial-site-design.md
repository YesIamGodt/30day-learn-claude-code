# 30天从零构建 Claude Code — 互动教程网站设计

## 背景

将现有的 Python 版 30 天教程，转换为一个带有前端互动的静态教程网站，让任何人都能在轻松愉快中学习 Agent 开发，无需查阅外部文档。

## 核心决策

| 问题 | 决策 | 原因 |
|------|------|------|
| 部署方式 | Vercel 静态导出 | 零成本，一键上线 |
| 教程语言 | JS/Node.js | WebContainer 只能跑 Node.js |
| 代码执行 | WebContainer API | 浏览器内真实运行，无需后端 |
| 用户状态 | localStorage | 无需登录，进度本地保存 |

---

## 1. 技术栈

| 层 | 技术 | 用途 |
|----|------|------|
| 框架 | Next.js 14 (App Router) + `output: 'export'` | 静态站点，SSR 也不要 |
| 语言 | TypeScript | 类型安全，减少 bug |
| 编辑器 | `@monaco-editor/react` | VS Code 同款内核 |
| 运行时 | WebContainer API (`@webcontainer/api`) | 浏览器内跑 Node.js |
| 样式 | Tailwind CSS | 快速迭代 |
| 状态 | Zustand + localStorage | 进度、打卡持久化 |
| 图标 | Lucide React | 简洁、一致 |

---

## 2. 页面结构

```
/                     首页 — 30天闯关地图（进度格）
/day/[n]              第N天教程页面
/simulator            AI 对话模拟器（独立入口）
```

### 2.1 首页 `/`

- Hero：标题 + 副标题 + 总体进度
- 30 天闯关地图：类似 GitHub contribution graph 的进度格
  - 未解锁：灰色锁定
  - 已解锁未完成：蓝色
  - 已完成（打卡）：绿色 + 打勾
- 快速入口：继续学习 / AI 对话模拟器
- Footer：项目介绍

### 2.2 教程页面 `/day/[n]`

每页结构（顺序固定）：

1. **Day 标题** + 今日目标（通俗语言，不是文档语言）
2. **概念讲解** — 去掉所有外部文档链接，内容自包含
3. **代码演示区** — Monaco Editor + WebContainer 运行按钮
   - 预填代码，学员可直接运行看结果
   - 点击"运行" → WebContainer 执行 → 下方显示输出
4. **填空练习区** — 同样的编辑器，但关键部分留空
   - 学员补全 → 点击"验证" → 实时反馈（绿对红错）
5. **答案展开** — 可折叠的完整答案
6. **打卡按钮** — 点击完成今日打卡，进度 +1

### 2.3 AI 对话模拟器 `/simulator`

- 终端风格 UI：深色背景 + 彩色输出
- 左侧：工具面板（可展开查看有哪些工具）
- 中间：对话流（用户输入 + AI 回复）
- 右侧：Token 计数器
- 输入框：`/` 自动触发命令提示
- 预置几个场景：搜索网页、读写文件、执行命令

---

## 3. 教程内容重构

### 3.1 内容原则

- **不引用外部文档**：所有概念自己讲清楚
- **通俗语言**：把"调用 Anthropic API"讲成"给 AI 发消息"
- **减少专业术语**：用类比替代定义
- **代码即内容**：代码不是示例，是教学内容的一部分

### 3.2 30天目录映射

| Day | 原主题 | 新标题（通俗化） |
|-----|--------|-----------------|
| 1 | Python CLI / argparse | 命令行是什么？我们来造个入口！ |
| 2 | 异步编程 async/await | 边等AI回复边刷剧——异步是什么？ |
| 3 | API 调用 | 怎么让代码"打电话"给 AI？ |
| 4 | 抽象基类 + 注册表 | 40+ 工具怎么管？用"工具箱"！ |
| 5 | 第一个工具 Bash | 让 AI 真正能执行命令 |
| 6 | Web 工具 | 让 AI 会用搜索、会读网页 |
| 7 | 对话历史 | AI 怎么记住之前说了什么？ |
| 8 | 工具循环 | AI 调用工具的完整过程 |
| 9 | Token 计数 | AI 对话是怎么"计费"的？ |
| 10 | REPL 主循环 | 输入 → AI 回复 → 再输入 |
| 11 | 权限系统 | 什么能让 AI 执行？什么不能？ |
| 12 | 上下文窗口 | AI 的"记忆容量"是多大？ |
| 13 | 错误处理 | AI 出错了怎么办？ |
| 14 | 配置管理 | 让用户自己设置 API Key |
| 15 | 里程碑1 | 小结：你的 AI 已经能跑起来了！ |
| 16 | 命令系统 | /help、/exit——斜杠命令 |
| 17 | 任务系统 | 把大任务拆成小步骤 |
| 18 | Plan Mode | AI 行动前先做计划 |
| 19 | 上下文压缩 | 历史太长了怎么办？ |
| 20 | 里程碑2 | 小结：更像真正的 Claude Code 了 |
| 21 | Skills 系统 | 把常用指令变成"快捷指令" |
| 22 | Memory | AI 怎么记住跨会话的事？ |
| 23 | 多 Agent | 让多个 AI 一起工作 |
| 24 | MCP 协议 | 什么是 MCP？为什么重要？ |
| 25 | 配置迁移 | 用户的设置怎么保存和迁移？ |
| 26 | 特性开关 | 新功能怎么灰度上线？ |
| 27 | 插件系统 | 怎么让别人扩展你的 AI？ |
| 28 | Textual TUI | 做个炫酷的终端界面！ |
| 29 | 测试 & CI | 代码写好了，怎么保证不出错？ |
| 30 | 毕业 | 你已经掌握了 Claude Code 的核心！ |

---

## 4. 互动设计

### 4.1 代码运行（WebContainer）

- 预置 Node.js 代码片段，点击"运行"
- WebContainer 在浏览器内启动 Node.js 进程
- 捕获 stdout/stderr，显示在输出面板
- 支持清除输出、重新运行
- 如果代码涉及 API 调用，显示提示："在 .env 里设置 ANTHROPIC_API_KEY"

### 4.2 填空验证

- 每个练习有唯一 ID 对应检查点
- 学员修改代码后，点击"检查"
- 前端比对关键片段是否匹配
- 实时反馈：
  - 对：绿色边框 + "答对了！继续"
  - 错：红色高亮缺失部分 + 提示文字
- 不做复杂的 AST 分析，基于字符串片段匹配

### 4.3 每日打卡

- localStorage 存储：`{ completedDays: [1, 2, 3, ...] }`
- 打卡后：Day 卡片变绿 + 庆祝动画（简单的 confetti）
- 30 天全完成：解锁"毕业徽章"

---

## 5. 视觉风格

### 调色板

| 用途 | 颜色 | 十六进制 |
|------|------|---------|
| 主色（强调/按钮） | 靛蓝紫 | `#6366F1` |
| 成功（答对/完成） | 翠绿 | `#22C55E` |
| 错误 | 玫红 | `#EF4444` |
| 警告/未完成 | 暖灰 | `#94A3B8` |
| 背景 | 暖白 | `#FAFAF9` |
| 深色背景（终端） | 深炭 | `#1C1C1E` |
| 代码文字 | 浅白 | `#E2E8F0` |

### 字体

- 标题：等宽感字体（JetBrains Mono 或系统等宽）
- 正文：清晰可读（Inter / system-ui）
- 代码：JetBrains Mono

### 布局节奏

- 教程页面：单列居中，最大宽度 800px
- 代码区：全宽，不受限
- 进度格：网格布局，响应式

---

## 6. 项目结构

```
claude-code-tutorial-site/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # 首页：闯关地图
│   │   ├── day/[n]/page.tsx         # 教程页
│   │   ├── simulator/page.tsx       # 对话模拟器
│   │   └── layout.tsx
│   ├── components/
│   │   ├── DayCard.tsx              # 进度格组件
│   │   ├── CodeEditor.tsx            # Monaco + 运行按钮
│   │   ├── ExerciseBlock.tsx         # 填空练习
│   │   ├── AnswerReveal.tsx          # 答案折叠
│   │   ├── CheckInButton.tsx         # 打卡按钮
│   │   ├── Simulator/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── ToolPanel.tsx
│   │   │   └── TokenCounter.tsx
│   │   └── ui/                       # shadcn/ui 组件
│   ├── content/
│   │   └── days/                     # 教程内容（MDX 格式）
│   │       ├── 01.md
│   │       ├── 02.md
│   │       └── ...                   # 30天内容
│   ├── lib/
│   │   ├── webcontainer.ts           # WebContainer 初始化
│   │   └── exercises.ts              # 填空验证逻辑
│   └── store/
│       └── progress.ts               # Zustand + localStorage
├── public/
│   └── favicon.svg
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 7. 实现优先级

### Phase 1：基础框架（先跑起来）
1. Next.js 项目初始化 + Tailwind
2. 首页 + 30 天进度格
3. 单天教程页面框架（静态内容，不含编辑器）
4. localStorage 打卡逻辑

### Phase 2：核心互动
5. Monaco Editor 集成
6. WebContainer 集成（代码运行）
7. 填空验证系统
8. 答案折叠组件

### Phase 3：对话模拟器
9. 终端风格 UI
10. 模拟对话流
11. Token 计数器

### Phase 4：内容与优化
12. 30 天 MDX 内容翻译/适配为 JS 版
13. 动画、打卡庆祝效果
14. 响应式适配
15. SEO + 部署

---

## 8. 风险与备选

| 风险 | 缓解方案 |
|------|---------|
| WebContainer 加载慢（首次 10MB） | 懒加载，点击运行后再初始化 |
| 30天内容翻译工作量大 | 先翻译前5天demo，后续并行 |
| WebContainer 不支持 Python | 已在决策阶段解决（转 JS） |
| Vercel 静态导出限制 | 不需要 SSR，所有状态本地 |
