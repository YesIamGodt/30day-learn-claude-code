# 教程增强实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现三栏布局 + 真实源码面板 + 源码详解模块，扩充 30 天教学内容

**Architecture:** 三栏：左侧教程正文（可运行JS）+ 右侧面板（Tab切换：源码展示 / 源码详解）。源码从 `src/` 目录读取，详解写在 frontmatter。

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Monaco Editor (`@monaco-editor/react`)

---

## 文件结构

```
components/
  SourceCodePanel.tsx    ← 新建：右侧源码面板
  DayPageClient.tsx      ← 修改：两栏布局
  DayContent.tsx         ← 修改：支持更多 Markdown 特性

lib/
  mdx.ts                 ← 修改：getSourceFiles()
  sourceFiles.ts         ← 新建：读取 src/ 源码的工具函数

app/day/[n]/
  page.tsx               ← 修改：传递 sourceFiles
```

---

## Task 1: 创建 SourceCodePanel.tsx

**文件：** `components/SourceCodePanel.tsx`（新建）

**说明：** 右侧源码面板组件，支持源码展示和源码详解两个 Tab，内嵌 Monaco Editor 读取 Python 文件，详解区域渲染 Markdown。

- [ ] **Step 1: 创建组件文件，写入基础结构和类型**

```tsx
"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { ChevronRight, ChevronLeft, FileCode, BookOpen } from "lucide-react";

export interface SourceFile {
  path: string;       // 相对于 src/ 的路径，如 "tools/bash.py"
  title: string;      // 显示标题，如 "BashTool 实现"
  content: string;     // 文件原始内容
  explainer: string;   // Markdown 格式的详解内容
}

interface SourceCodePanelProps {
  files: SourceFile[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function SourceCodePanel({ files, collapsed, onToggleCollapse }: SourceCodePanelProps) {
  const [activeTab, setActiveTab] = useState<"source" | "explainer">("source");
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  if (files.length === 0) return null;
  const currentFile = files[activeFileIndex];

  return (
    <div className={`shrink-0 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white transition-all duration-300 ${collapsed ? "w-12" : "w-[480px]"}`}>
      {/* 折叠/展开按钮 */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center h-10 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors text-muted"
      >
        {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {!collapsed && (
        <>
          {/* Tab Bar */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab("source")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${activeTab === "source" ? "text-primary border-b-2 border-primary bg-white" : "text-muted hover:text-gray-700"}`}
            >
              <FileCode className="w-3.5 h-3.5" /> 源码
            </button>
            <button
              onClick={() => setActiveTab("explainer")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${activeTab === "explainer" ? "text-primary border-b-2 border-primary bg-white" : "text-muted hover:text-gray-700"}`}
            >
              <BookOpen className="w-3.5 h-3.5" /> 详解
            </button>
          </div>

          {/* 文件选择器（多文件时显示） */}
          {files.length > 1 && (
            <div className="px-3 py-2 border-b border-gray-100">
              <select
                value={activeFileIndex}
                onChange={e => setActiveFileIndex(Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
              >
                {files.map((f, i) => (
                  <option key={i} value={i}>{f.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* 内容区 */}
          <div className="flex-1 overflow-auto">
            {activeTab === "source" && (
              <Editor
                height="100%"
                defaultLanguage="python"
                value={currentFile.content}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 12 },
                  domId: `source-editor-${activeFileIndex}`,
                }}
              />
            )}

            {activeTab === "explainer" && (
              <div className="p-4">
                <SourceExplainer content={currentFile.explainer} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 添加 SourceExplainer 子组件（在同一文件底部）**

在 `SourceCodePanel.tsx` 文件底部添加：

```tsx
/** 源码详解渲染器 — 简单 Markdown 子集 */
function SourceExplainer({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H2
    if (line.startsWith("## ")) {
      nodes.push(<h2 key={key++} className="text-lg font-semibold mt-6 mb-2 text-gray-800">{line.slice(3)}</h2>);
      i++; continue;
    }
    // H3
    if (line.startsWith("### ")) {
      nodes.push(<h3 key={key++} className="text-base font-medium mt-4 mb-1.5 text-gray-700">{line.slice(4)}</h3>);
      i++; continue;
    }
    // 表格行（简化：检测 | 字符）
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      // 渲染表格（去掉分隔行 ---）
      const rows = tableLines.filter(l => !l.match(/^\|\s*[-:]+\|/));
      if (rows.length > 0) {
        nodes.push(
          <div key={key++} className="overflow-x-auto my-3">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className={ri === 0 ? "bg-gray-50 font-medium" : "border-t border-gray-100"}>
                    {row.split("|").slice(1, -1).map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-gray-700">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }
    // 代码块
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3);
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing
      nodes.push(
        <pre key={key++} className="bg-[#1e1e1e] text-green-400 rounded-lg p-3 text-xs font-mono my-2 overflow-x-auto">
          {codeLines.join("\n")}
        </pre>
      );
      continue;
    }
    // 空行
    if (line.trim() === "") { i++; continue; }
    // 普通段落
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].trim().startsWith("```") && !lines[i].trim().startsWith("|")) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      nodes.push(<p key={key++} className="text-sm text-gray-600 leading-relaxed my-2">{paraLines.join(" ")}</p>);
    }
  }

  return <div className="space-y-0.5">{nodes}</div>;
}
```

- [ ] **Step 3: 验证组件**

Run: `grep -n "SourceCodePanel" components/SourceCodePanel.tsx`
Expected: 找到组件导出

---

## Task 2: 创建 lib/sourceFiles.ts

**文件：** `lib/sourceFiles.ts`（新建）

- [ ] **Step 1: 写工具函数**

```ts
import fs from "fs";
import path from "path";
import { getDayContent } from "./mdx";

export interface SourceFile {
  path: string;       // 相对路径，如 "tools/bash.py"
  title: string;       // 显示标题
  content: string;     // 文件内容
  explainer: string;    // Markdown 详解
}

/**
 * 读取 src/ 目录下指定文件的内容
 */
export function readSourceFile(relativePath: string): string | null {
  const filePath = path.join(process.cwd(), "src", relativePath);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * 根据 day 加载源码文件和详解内容
 */
export function getSourceFiles(day: number): SourceFile[] {
  const data = getDayContent(day);
  if (!data?.sourceFiles || data.sourceFiles.length === 0) return [];

  return data.sourceFiles.map(sf => {
    const content = readSourceFile(sf.path) ?? `// 文件未找到: ${sf.path}`;
    return {
      path: sf.path,
      title: sf.title,
      content,
      explainer: sf.explainer ?? "",
    };
  });
}
```

---

## Task 3: 扩展 lib/mdx.ts

**文件：** `lib/mdx.ts`（修改）

- [ ] **Step 1: 扩展 DayContent 接口**

在 `DayContent` 接口中添加：
```ts
sourceFiles: {
  path: string;
  title: string;
  explainer: string;
}[];
```

- [ ] **Step 2: 修改 getDayContent 函数**

在 `getDayContent` 返回值中加上：
```ts
sourceFiles: data.sourceFiles ?? [],
```

---

## Task 4: 重构 DayPageClient.tsx — 两栏布局

**文件：** `components/DayPageClient.tsx`（修改）

- [ ] **Step 1: 添加 useState 和 SourceCodePanel 导入**

```tsx
import { useState } from "react";
import { SourceCodePanel, SourceFile } from "@/components/SourceCodePanel";
```

- [ ] **Step 2: 添加新 props 和状态**

```tsx
interface DayPageClientProps {
  // ...原有props
  sourceFiles?: SourceFile[];
}

// DayPageClient 内
const [panelCollapsed, setPanelCollapsed] = useState(false);
```

- [ ] **Step 3: 重构 return — 两栏布局**

把原来 `max-w-3xl mx-auto px-6 py-10` 的外层 div 替换为：

```tsx
return (
  <div className="min-h-screen bg-warm">
    {/* 顶部 Header */}
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-mono text-muted">Day {day} / 30</span>
        <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">← 闯关地图</Link>
      </div>
    </div>

    {/* 两栏主体 */}
    <div className="max-w-[1400px] mx-auto px-6 pb-16 flex gap-6 items-start">
      {/* 左侧：教程正文 */}
      <div className="flex-1 min-w-0">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          {day > 1 ? (
            <Link href={`/day/${day - 1}`} className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" /> Day {day - 1}
            </Link>
          ) : <span />}

          {day < 30 && (
            <Link href={`/day/${day + 1}`} className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors">
              Day {day + 1} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* 标题 */}
        <h1 className="text-3xl font-bold font-mono mb-3">Day {day}: {title}</h1>

        {/* 学习目标 */}
        {objectives.length > 0 && (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">学习目标</h2>
            <ul className="space-y-2">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="text-primary mt-0.5 shrink-0 font-bold">✓</span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 正文 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-12">
          <DayContent rawContent={rawContent} demoCode={demoCode} />
        </div>

        {/* 打卡 */}
        <div className="flex justify-center mt-8 pt-8 border-t border-gray-200">
          <CheckInButton day={day} />
        </div>
      </div>

      {/* 右侧：源码面板 */}
      {sourceFiles && sourceFiles.length > 0 && (
        <SourceCodePanel
          files={sourceFiles}
          collapsed={panelCollapsed}
          onToggleCollapse={() => setPanelCollapsed(c => !c)}
        />
      )}
    </div>
  </div>
);
```

- [ ] **Step 4: 导入缺失的依赖**

确保已导入：`Link`, `ChevronLeft`, `ChevronRight` from `lucide-react`

---

## Task 5: 修改 app/day/[n]/page.tsx — 传递 sourceFiles

**文件：** `app/day/[n]/page.tsx`（修改）

- [ ] **Step 1: 添加 getSourceFiles 导入并修改组件**

```tsx
import { getDayContent } from "@/lib/mdx";
import { getSourceFiles } from "@/lib/sourceFiles";

export default async function DayPage({ params }: PageProps) {
  // ...现有逻辑...
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

## Task 6: 扩充 Day 1 ~ Day 10 内容

**文件：** `content/days/01.md` ~ `content/days/10.md`

**说明：** 每个文件扩充 3-5 倍，添加：
1. 丰富的背景描述（"这一节要解决什么问题"扩展到 3-5 段）
2. ASCII 图解或流程说明
3. 基础知识 + 进阶知识分段
4. 知识点速查表（表格）
5. 面试题/扩展思考小节
6. frontmatter 添加 `sourceFiles` 字段

以下是各天的 sourceFiles 映射：

| Day | frontmatter sourceFiles |
|-----|------------------------|
| 1 | 无（CLI 入口，src/ 无对应） |
| 2 | `history.py`（对话历史） |
| 3 | 无（对话轮次逻辑） |
| 4 | `tools/base.py`, `tools/registry.py` |
| 5 | `tools/bash.py`, `tools/file_read.py`, `tools/file_write.py` |
| 6 | `tools/web_search.py`, `tools/web_fetch.py` |
| 7 | `history.py`（对话历史数据结构） |
| 8 | `day-08/engine.py` |
| 9 | `day-09/token_counter.py` |
| 10 | `day-10/repl.py` |

**内容扩充示例（以 Day 1 为基准）：**

- [ ] **Step 1: Day 1** — 扩充 CLI 参数解析，增加 `process.argv` 详解，增加 `yargs` / `minimist` 库介绍，增加常见 CLI 参数模式
- [ ] **Step 2: Day 2** — 扩充日志系统，增加 log level 概念，增加彩色日志实现
- [ ] **Step 3: Day 3** — 扩充配置管理，增加 .env 文件详解，增加 Python `os.getenv` vs Node.js `process.env` 对比
- [ ] **Step 4: Day 4** — 扩充工具注册表，增加 BaseTool 泛型讲解，增加工厂模式介绍
- [ ] **Step 5: Day 5** — 扩充 BashTool，增加 asyncio subprocess 详解，增加 shell injection 安全隐患
- [ ] **Step 6: Day 6** — 扩充 Web 工具，增加 HTTP 协议基础，增加 async/await 深入讲解
- [ ] **Step 7: Day 7** — 扩充 ConversationHistory，增加数据结构设计思路，增加消息序列化
- [ ] **Step 8: Day 8** — 扩充 QueryEngine，增加 ReAct 论文背景，增加循环终止条件详解
- [ ] **Step 9: Day 9** — 扩充 Token 计算，增加 Transformer 原理简介，增加成本估算
- [ ] **Step 10: Day 10** — 扩充 REPL 实现，增加交互式输入原理，增加 readline 模块

---

## Task 7: 扩充 Day 11 ~ Day 20 内容

**文件：** `content/days/11.md` ~ `content/days/20.md`

| Day | frontmatter sourceFiles |
|-----|------------------------|
| 11 | `permission.py` |
| 12 | `day-12/context.py` |
| 13 | `day-13/retry.py` |
| 14 | `day-14/config.py` |
| 15 | 无（无对应源码） |
| 16 | `day-16/commands.py` |
| 17 | `day-17/task_manager.py` |
| 18 | `day-18/plan_mode.py` |
| 19 | `day-19/compactor.py` |
| 20 | `day-20/main.py` |

- [ ] **Step 1: Day 11** — 扩充权限系统，增加正则表达式详解，增加危险命令检测逻辑
- [ ] **Step 2: Day 12** — 扩充上下文窗口，增加 LLM 上下文限制原理，增加压缩策略
- [ ] **Step 3: Day 13** — 扩充重试机制，增加指数退避算法，增加熔断器模式
- [ ] **Step 4: Day 14** — 扩充配置管理，增加配置继承，覆盖优先级
- [ ] **Step 5: Day 15** — 扩充 MCP（模型上下文协议），增加协议设计思想
- [ ] **Step 6: Day 16** — 扩充命令系统，增加命令注册机制，增加子命令架构
- [ ] **Step 7: Day 17** — 扩充任务管理，增加任务队列设计，增加并发控制
- [ ] **Step 8: Day 18** — 扩充 Plan Mode，增加 Agent 规划策略，增加自我反思机制
- [ ] **Step 9: Day 19** — 扩充会话压缩，增加历史摘要算法，增加重要性打分
- [ ] **Step 10: Day 20** — 扩充 Agent 架构，增加多 Agent 协作，增加状态机设计

---

## Task 8: 扩充 Day 21 ~ Day 30 内容

**文件：** `content/days/21.md` ~ `content/days/30.md`

| Day | frontmatter sourceFiles |
|-----|------------------------|
| 21 | `day-21/skill.py` |
| 22 | `day-22/memory.py` |
| 23 | `day-23/agent.py` |
| 24 | `day-24/mcp_client.py` |
| 25 | `day-25/migration.py` |
| 26 | `day-26/feature_flags.py` |
| 27 | `day-27/plugins.py` |
| 28 | `day-28/tui.py` |
| 29 | `day-29/main.py` |
| 30 | `day-30/main.py` |

- [ ] **Step 1: Day 21** — 扩充 Skill 系统，增加步骤式执行，增加技能注册机制
- [ ] **Step 2: Day 22** — 扩充记忆系统，增加向量数据库介绍，增加记忆优先级
- [ ] **Step 3: Day 23** — 扩充 Agent 架构，增加感知-思考-行动循环
- [ ] **Step 4: Day 24** — 扩充 MCP Client，增加协议编解码
- [ ] **Step 5: Day 25** — 扩充数据迁移，增加版本兼容策略
- [ ] **Step 6: Day 26** — 扩充 Feature Flags，增加灰度发布策略
- [ ] **Step 7: Day 27** — 扩充插件系统，增加热加载机制
- [ ] **Step 8: Day 28** — 扩充 TUI 实现，增加终端渲染原理
- [ ] **Step 9: Day 29** — 扩充发布准备，增加测试策略
- [ ] **Step 10: Day 30** — 扩充完整项目串联，增加架构全景图

---

## Task 9: 验证构建

- [ ] **Step 1: 运行开发服务器**

Run: `cd "D:/coding/project/claude-code/claude-code-tutorial/.worktrees/tutorial-site" && npm run dev`
Expected: 编译成功，无 TypeScript 错误

- [ ] **Step 2: 验证 Day 4 页面**

打开 `http://localhost:3000/day/4`，检查：
- 右侧源码面板显示（`tools/base.py` + `tools/registry.py`）
- Tab 切换「源码」/「详解」正常
- Monaco Editor 语法高亮正常
- 详解 Tab 渲染 Markdown（标题、表格、代码块）

- [ ] **Step 3: 验证 Day 1 页面（无源码）**

打开 `http://localhost:3000/day/1`，检查：
- 右侧源码面板不显示（files.length === 0 时返回 null）

- [ ] **Step 4: 验证面板折叠**

在 Day 4 页面，点击折叠按钮，检查面板宽度切换正常

---

## Task 10: Git 提交

- [ ] **Step 1: 提交所有变更**

```bash
cd "D:/coding/project/claude-code/claude-code-tutorial/.worktrees/tutorial-site"
git add -A
git commit -m "$(cat <<'EOF'
feat: tutorial enrichment - source code panel and expanded content

- Add SourceCodePanel component with Monaco Editor for Python source
- Add SourceExplainer with Markdown rendering for code explanations
- Refactor DayPageClient to two-column layout
- Add getSourceFiles() to load real Python source from src/
- Expand frontmatter for all 30 days with sourceFiles config
- Expand all 30 tutorial .md files with richer content

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 2: Push to remote**

```bash
git push origin tutorial-site
```
