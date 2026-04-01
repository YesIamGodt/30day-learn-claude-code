# 教程增强设计规格

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 30 天教程网站从单栏简单内容升级为三栏布局 + 真实源码面板 + 逐文件详细讲解，大幅提升教学深度。

**Architecture:** 三栏布局：左侧教程正文（可编辑JS演示） + 右侧面板（Tab切换：源码展示 / 源码详解）。源码直接从 `D:\coding\project\claude-code\claude-code-tutorial\src\` 目录读取，详解内容手写在 Markdown frontmatter 的 `sourceFiles` 字段中。

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), `gray-matter`（已有）

---

## 1. 布局结构

### 整体布局（两栏 + Header）

```
┌────────────────────────────────────────────────────────────────┐
│  Day 1 / 30    命令行入口                        ← 闯关地图    │
├─────────────────────────────┬──────────────────────────────────┤
│                             │  [源码] [详解]  ← Tab切换按钮     │
│  教程正文（max-w-2xl）       │  ┌──────────────────────────────┐ │
│                             │  │ # BashTool 实现              │ │
│  · 标题 + 学习目标卡片        │  │ class BashTool:             │ │
│  · 丰富正文（扩充3-5倍）      │  │   def execute(self, cmd):   │ │
│  · 图解 / 对比表格 / 注解     │  │     ...                      │ │
│  · 代码演示（Monaco Editor）  │  └──────────────────────────────┘ │
│                             │                                  │
│                             │  源码详解（Tab2时显示）            │
│                             │  · 文件概述                       │
│                             │  · 逐类/逐函数讲解                 │
│                             │  · JS vs Python 对比              │
│                             │  · 设计意图说明                    │
├─────────────────────────────┴──────────────────────────────────┤
│                    [打卡 Day 1]                                │
└────────────────────────────────────────────────────────────────┘
```

### 布局规格

- 外层：flex-row，左侧 `flex-1`（教程正文），右侧 `w-[480px] shrink-0`（源码面板）
- 右侧面板默认展开，右侧有「收起/展开」按钮
- 移动端：右侧面板默认折叠，点击按钮展开为底部抽屉
- 左侧教程正文：`max-w-2xl`，原来 `max-w-3xl` 偏宽，改窄让三栏视觉更平衡

---

## 2. 源码面板组件 `SourceCodePanel.tsx`

**文件：** `components/SourceCodePanel.tsx`

### Props

```tsx
interface SourceCodePanelProps {
  files: SourceFile[];  // 见下方类型定义
  activeTab: "source" | "explainer";
  onTabChange: (tab: "source" | "explainer") => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface SourceFile {
  path: string;        // 相对于 src/ 的路径，如 "tools/bash.py"
  title: string;       // 显示标题，如 "BashTool 实现"
  content: string;      // 文件原始内容
  explainer?: string;   // Markdown 格式的详解内容（可选）
}
```

### 内部结构

- **Tab Bar**：两个按钮 `[源码]` `[详解]`
- **源码 Tab**：
  - 文件选择下拉（如果 files.length > 1）
  - Monaco Editor（`language="python"`, `readOnly`, `theme="vs-dark"`）
  - 行高亮功能：每段源码配一个 `highlights` 数组，指定高亮哪些行，显示左侧色条
- **详解 Tab**：
  - 文件级概述（第一段）
  - 折叠式逐类/函数讲解
  - JS vs Python 对比表格
  - 设计意图说明

---

## 3. 新增类型和工具函数

**文件：** `lib/sourceFiles.ts`

```ts
export interface SourceFile {
  path: string;       // 相对于 src/ 的路径
  title: string;      // 显示标题
  content: string;     // 文件内容（从磁盘读取）
  explainer: string;   // 详解 Markdown
}

export interface DaySourceConfig {
  sourceFiles: {
    path: string;      // 相对路径，如 "tools/bash.py"
    title: string;
    explainer: string; // 详解内容（Markdown 格式）
  }[];
}

/**
 * 读取 src/ 目录下指定文件的内容
 */
export function readSourceFile(dayNum: number, relativePath: string): string | null

/**
 * 根据 day 读取 frontmatter 的 sourceFiles 配置，
 * 并加载对应文件的源码内容
 */
export function getSourceFiles(dayNum: number): SourceFile[]
```

实现思路：
- frontmatter 中 `sourceFiles` 声明路径和标题、详解内容
- `readSourceFile` 用 `fs.readFileSync` 从 `path.join(process.cwd(), 'src', relativePath)` 读取

---

## 4. frontmatter 扩展

每个 `.md` 文件 frontmatter 新增 `sourceFiles` 字段：

```yaml
---
title: 工具调用循环：AI 怎么做决策？
objectives:
  - 理解 ReAct 循环
  - 实现工具调用引擎
sourceFiles:
  - path: day-08/engine.py
    title: QueryEngine 实现
    explainer: |
      ## QueryEngine — 工具调用循环引擎

      这是整个 Claude Code 的大脑。每次用户发来一条指令，
      QueryEngine 负责让 AI 思考 → 调用工具 → 看结果 → 再思考。

      ### 核心字段

      - `client`：Anthropic API 客户端实例
      - `history`：对话历史记录
      - `max_turns`：最大循环次数（防止无限循环）

      ### run() 方法流程

      1. 进入循环（最多 max_turns 次）
      2. 调用 `step()` 获取 AI 响应
      3. 如果没有工具调用 → 返回 AI 的最终回复
      4. 如果有工具调用 → 执行每个工具，把结果加回历史 → 继续循环

      ### JS vs Python 对比

      | 特性 | JS 教程版 | Python 真实版 |
      |------|---------|-------------|
      | API 调用 | fetch() | anthropic SDK |
      | 工具列表 | registry.list() | registry.list_tools() |
      | 工具执行 | await tool.execute() | await tool.execute() |
      | 错误处理 | try/catch | try/except |
---
```

**关键点：** `explainer` 字段手写 Markdown 格式的详细讲解，可以很长（支持多级标题、表格、代码块）。

---

## 5. DayPageClient 重构

**文件：** `components/DayPageClient.tsx`（修改）

```tsx
// 新增 props
interface DayPageClientProps {
  // ...原有props
  sourceFiles?: SourceFile[];  // 源码文件列表
}
```

- 外层 div 改为 `flex flex-row gap-6`
- 左侧：教程正文（`flex-1 min-w-0`）
- 右侧：`SourceCodePanel` 组件（`w-[480px] shrink-0`）
- 面板折叠状态由 useState 管理

---

## 6. app/day/[n]/page.tsx 扩展

**文件：** `app/day/[n]/page.tsx`（修改）

```tsx
export default async function DayPage({ params }: PageProps) {
  const day = parseInt(params.n, 10);
  if (isNaN(day) || day < 1 || day > 30) notFound();

  const data = getDayContent(day);
  if (!data) notFound();

  // 加载源码文件
  const sourceFiles = getSourceFiles(day);

  return (
    <DayPageClient
      day={day}
      title={data.title}
      objectives={data.objectives}
      rawContent={data.content}
      demoCode={data.demoCode}
      sourceFiles={sourceFiles}
    />
  );
}
```

---

## 7. lib/mdx.ts 扩展

**文件：** `lib/mdx.ts`（修改）

```ts
// getDayContent 新增返回 sourceFiles 配置（纯配置，无源码内容）
export interface DayContent {
  day: number;
  title: string;
  objectives: string[];
  content: string;
  demoCode: string;
  exercises: ...;
  sourceFiles: {
    path: string;
    title: string;
    explainer: string;
  }[];
}

// getSourceFiles() — 独立函数，读取真实文件
import path from "path";
import fs from "fs";

export function getSourceFiles(day: number) {
  const data = getDayContent(day);
  if (!data?.sourceFiles) return [];

  return data.sourceFiles.map(sf => {
    const filePath = path.join(process.cwd(), "src", sf.path);
    const content = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, "utf-8")
      : `// 文件未找到: ${sf.path}`;
    return { ...sf, content };
  });
}
```

---

## 8. 内容扩充规范（30 个 md 文件）

每篇内容从原来平均 ~80 行扩充至 ~200-300 行，结构如下：

```markdown
---
title: ...
objectives:
  - ...
  - ...
sourceFiles:
  - path: ...
    title: ...
    explainer: |
      ## 标题

      详解内容（多段，支持 H2/H3/表格/代码块）
---

# Day N: 标题

## 这一节要解决什么问题？（100-150字，丰富背景）

## 概念图解（ASCII 或文字图）

## 基础知识（2-3个子节，每节 3-5 段）

## 进阶知识（2-3 个小节，供想深入的同学）

## 代码演示（可直接运行）

```js
// 带完整中文注释的代码
```

## 知识点速查表（表格形式）

## 面试题 / 扩展思考（可选）

## 动手练习
```

---

## 9. 验收标准

- [ ] 30 个页面都有右侧源码面板（部分页面 sourceFiles 为空时面板不显示）
- [ ] 源码面板可以切换「源码」和「详解」两个 Tab
- [ ] Monaco Editor 正确显示 Python 语法高亮
- [ ] 详解内容正确渲染 Markdown（标题、表格、代码块）
- [ ] 右侧面板可折叠/展开
- [ ] 移动端布局正确降级（面板默认折叠）
- [ ] 30 篇内容全部扩充到位
- [ ] `npm run dev` 无编译错误
