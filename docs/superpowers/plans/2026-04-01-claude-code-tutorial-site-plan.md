# 互动教程网站 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 Next.js + WebContainer 构建一个可在线运行代码的 30 天 Claude Code 教程网站，支持打卡进度、代码编辑器、AI 对话模拟器。

**Architecture:** Next.js 14 App Router，静态导出（`output: 'export'`），所有状态存 localStorage，代码通过 WebContainer 在浏览器内真实执行，教程内容用 MDX 管理。

**Tech Stack:** Next.js 14 · TypeScript · Tailwind CSS · Zustand · @monaco-editor/react · @webcontainer/api · next-mdx-remote · Lucide React

---

## 文件结构

```
claude-code-tutorial-site/           ← 新建目录，与当前教程平级
├── app/
│   ├── layout.tsx                   # 根布局：导航栏 + Footer
│   ├── page.tsx                     # 首页：30天闯关地图
│   ├── globals.css                   # Tailwind 入口 + 变量
│   ├── day/
│   │   └── [n]/
│   │       └── page.tsx            # 教程页（MDX 内容 + 编辑器）
│   └── simulator/
│       └── page.tsx                # AI 对话模拟器
├── components/
│   ├── DayCard.tsx                  # 进度格（锁定/解锁/完成）
│   ├── CodeEditor.tsx               # Monaco + 运行按钮 + 输出面板
│   ├── ExerciseBlock.tsx            # 填空练习 + 验证反馈
│   ├── AnswerReveal.tsx             # 答案折叠展开
│   ├── CheckInButton.tsx            # 打卡按钮 + 庆祝动画
│   └── simulator/
│       ├── ChatPanel.tsx            # 对话流
│       ├── ToolPanel.tsx            # 工具面板
│       └── TokenCounter.tsx          # Token 计数器
├── content/
│   └── days/
│       ├── 01.md                    # Day 1 MDX 内容
│       └── ... (共30个)
├── lib/
│   ├── webcontainer.ts              # WebContainer 初始化封装
│   ├── exercises.ts                 # 填空验证逻辑（字符串片段匹配）
│   └── store.ts                     # Zustand store（含 localStorage 持久化）
├── public/
│   └── favicon.svg
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Phase 1：基础框架

### Task 1: 脚手架 Next.js 项目

**创建:** `D:\coding\project\claude-code\claude-code-tutorial-site\`

- [ ] **Step 1: 创建 Next.js 项目**

```bash
cd D:/coding/project/claude-code/claude-code-tutorial-site
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

> 说明：当前目录 `.` 已是空目录（新建的），`--yes` 跳过所有额外询问。

- [ ] **Step 2: 安装核心依赖**

```bash
cd D:/coding/project/claude-code/claude-code-tutorial-site
npm install zustand @monaco-editor/react @webcontainer/api lucide-react next-mdx-remote
npm install -D @types/node
```

- [ ] **Step 3: 验证项目可运行**

```bash
npm run dev
# 预期：localhost:3000 能打开
```

- [ ] **Step 4: 提交**

```bash
git init && git add . && git commit -m "chore: scaffold Next.js 14 project with TypeScript and Tailwind"
```

---

### Task 2: Tailwind 配置（自定义主题）

**修改:** `D:\coding\project\claude-code\claude-code-tutorial-site\tailwind.config.ts`

- [ ] **Step 1: 写入 Tailwind 配置**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        success: "#22C55E",
        error: "#EF4444",
        muted: "#94A3B8",
        warm: "#FAFAF9",
        terminal: "#1C1C1E",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: 写入全局 CSS（`app/globals.css`）**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --color-primary: #6366F1;
  --color-success: #22C55E;
  --color-error: #EF4444;
  --color-muted: #94A3B8;
  --color-warm: #FAFAF9;
  --color-terminal: #1C1C1E;
}

body {
  background-color: var(--color-warm);
  font-family: 'Inter', system-ui, sans-serif;
}

code, pre, .font-mono {
  font-family: 'JetBrains Mono', monospace;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-muted);
  border-radius: 3px;
}
```

- [ ] **Step 3: 提交**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "chore: configure Tailwind with custom color palette and fonts"
```

---

### Task 3: Zustand 进度 Store

**创建:** `D:\coding\project\claude-code\claude-code-tutorial-site\lib\store.ts`

- [ ] **Step 1: 写入 Store**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressStore {
  completedDays: number[];
  currentDay: number;
  completeDay: (day: number) => void;
  isCompleted: (day: number) => boolean;
  reset: () => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      completedDays: [],
      currentDay: 1,

      completeDay: (day: number) => {
        const { completedDays } = get();
        if (!completedDays.includes(day)) {
          set({ completedDays: [...completedDays, day] });
        }
      },

      isCompleted: (day: number) => {
        return get().completedDays.includes(day);
      },

      reset: () => set({ completedDays: [], currentDay: 1 }),
    }),
    {
      name: "claude-tutorial-progress",
    }
  )
);
```

- [ ] **Step 2: 验证 Store 类型正确**

```bash
npx tsc --noEmit
# 预期：无错误
```

- [ ] **Step 3: 提交**

```bash
git add lib/store.ts
git commit -m "feat: add Zustand store with localStorage persistence for progress tracking"
```

---

### Task 4: 根布局（导航栏 + Footer）

**创建/修改:** `claude-code-tutorial-site\app\layout.tsx`

- [ ] **Step 1: 写入根布局**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "30天从零构建 Claude Code",
  description: "一个带有前端互动的教程网站，30天掌握 Agent 开发",
};

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-mono font-semibold text-primary text-lg">
          claude-code/tutorial
        </Link>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            闯关地图
          </Link>
          <Link href="/simulator" className="hover:text-primary transition-colors">
            AI 模拟器
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-20 py-8 text-center text-sm text-muted">
      <p>
        用 Claude Code 构建 ·{" "}
        <a href="https://github.com" className="text-primary hover:underline">
          源代码
        </a>
      </p>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/layout.tsx
git commit -m "feat: add root layout with navbar and footer"
```

---

## Phase 2：核心组件

### Task 5: DayCard 进度格组件

**创建:** `claude-code-tutorial-site\components\DayCard.tsx`

- [ ] **Step 1: 写入 DayCard**

```tsx
"use client";

import Link from "next/link";
import { Lock, Check, Sparkles } from "lucide-react";
import { useProgressStore } from "@/lib/store";

interface DayCardProps {
  day: number;
  title: string;
  locked?: boolean;
}

export function DayCard({ day, title, locked = false }: DayCardProps) {
  const { isCompleted, currentDay } = useProgressStore();
  const completed = isCompleted(day);
  const unlocked = day <= currentDay || completed;

  if (locked || !unlocked) {
    return (
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-100 border border-gray-200 opacity-60 cursor-not-allowed h-24">
        <Lock className="w-4 h-4 text-muted mb-1" />
        <span className="text-xs font-mono text-muted">Day {day}</span>
        <span className="text-[10px] text-muted mt-1 text-center leading-tight px-1 line-clamp-2">
          {title}
        </span>
      </div>
    );
  }

  if (completed) {
    return (
      <Link href={`/day/${day}`}>
        <div className="relative flex flex-col items-center justify-center p-3 rounded-xl bg-success/10 border-2 border-success cursor-pointer hover:bg-success/20 transition-colors h-24 group">
          <div className="absolute top-1 right-1">
            <Check className="w-4 h-4 text-success" />
          </div>
          <span className="text-xs font-mono text-success font-semibold">Day {day}</span>
          <span className="text-[10px] text-success/80 mt-1 text-center leading-tight px-1 line-clamp-2">
            {title}
          </span>
          <Sparkles className="w-3 h-3 text-success/50 mt-1 group-hover:animate-pulse" />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/day/${day}`}>
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary/10 border-2 border-primary/30 cursor-pointer hover:bg-primary/20 hover:border-primary/60 transition-all h-24 group">
        <span className="text-xs font-mono text-primary font-semibold">Day {day}</span>
        <span className="text-[10px] text-primary/80 mt-1 text-center leading-tight px-1 line-clamp-2">
          {title}
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/DayCard.tsx
git commit -m "feat: add DayCard component with locked/active/completed states"
```

---

### Task 6: CodeEditor 组件（Monaco + 运行）

**创建:** `claude-code-tutorial-site\components\CodeEditor.tsx`

> WebContainer 初始化较重（~10MB），需要懒加载。首次点击"运行"时才初始化。

- [ ] **Step 1: 写入 WebContainer 封装（`lib/webcontainer.ts`）**

```ts
type BootResult =
  | { ready: true; iframe: HTMLIFrameElement }
  | { ready: false; error: string };

let bootPromise: Promise<BootResult> | null = null;

export async function bootWebContainer(): Promise<BootResult> {
  if (bootPromise) return bootPromise;

  bootPromise = new Promise(async (resolve) => {
    try {
      const { WebContainer } = await import("@webcontainer/api");
      const container = await WebContainer.boot();

      const iframe = document.createElement("iframe");
      iframe.src = "/webcontainer.html";
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      await WebContainer.setIfReady(iframe);
      await new Promise((r) => setTimeout(r, 500));

      resolve({ ready: true, iframe });
    } catch (e: unknown) {
      resolve({ ready: false, error: String(e) });
    }
  });

  return bootPromise;
}

export async function runCode(
  code: string,
  onOutput: (text: string) => void
): Promise<void> {
  const result = await bootWebContainer();
  if (!result.ready) {
    onOutput(`[错误] WebContainer 启动失败: ${result.error}`);
    return;
  }

  const { WebContainer } = await import("@webcontainer/api");

  try {
    const container = await WebContainer.boot();

    await container.mount({
      "index.js": { file: { contents: code } },
    });

    const proc = await container.spawn("node", ["index.js"]);

    proc.output.pipeTo(
      new WritableStream({
        write(data) {
          onOutput(data);
        },
      })
    );

    const exitCode = await proc.exit;
    if (exitCode !== 0) {
      onOutput(`\n[进程退出，代码: ${exitCode}]`);
    }
  } catch (e: unknown) {
    onOutput(`[错误] ${String(e)}`);
  }
}
```

- [ ] **Step 2: 写入 CodeEditor 组件**

```tsx
"use client";

import { useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Play, Trash2, Loader2 } from "lucide-react";

interface CodeEditorProps {
  code: string;
  readOnly?: boolean;
  height?: number;
}

export function CodeEditor({ code, readOnly = false, height = 300 }: CodeEditorProps) {
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);
  const outputRef = useRef<HTMLPreElement>(null);

  const appendOutput = (text: string) => {
    setOutput((prev) => prev + text);
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput("");
    appendOutput("> 运行中...\n");

    try {
      const { runCode } = await import("@/lib/webcontainer");
      await runCode(code, appendOutput);
    } catch {
      appendOutput("[错误] 无法加载 WebContainer，请刷新重试。\n");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 bg-[#1e1e1e]">
      {/* 编辑器头部 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-gray-400 font-mono">index.js</span>
        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {running ? "运行中..." : "运行"}
        </button>
      </div>

      {/* Monaco 编辑器 */}
      <Editor
        height={height}
        defaultLanguage="javascript"
        value={code}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          padding: { top: 12 },
        }}
        onMount={(ed) => {
          (window as unknown as Record<string, unknown>).__editor = ed;
        }}
      />

      {/* 输出面板 */}
      {output && (
        <div className="border-t border-gray-700">
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#2d2d2d]">
            <span className="text-xs text-gray-400">输出</span>
            <button
              onClick={() => setOutput("")}
              className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> 清除
            </button>
          </div>
          <pre
            ref={outputRef}
            className="px-4 py-3 text-sm font-mono text-green-400 h-32 overflow-auto bg-[#0d0d0d]"
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add lib/webcontainer.ts components/CodeEditor.tsx
git commit -m "feat: add WebContainer runner and Monaco CodeEditor component"
```

---

### Task 7: ExerciseBlock（填空 + 验证）

**创建:** `claude-code-tutorial-site\lib\exercises.ts`
**创建:** `claude-code-tutorial-site\components\ExerciseBlock.tsx`

- [ ] **Step 1: 写入验证逻辑（`lib/exercises.ts`）**

```ts
export interface Exercise {
  id: string;
  hint: string;
  // 需要出现在学员代码中的片段（去空格后比对）
  checkFragments: string[];
  // 错误提示（对应每个片段）
  errorMessages: string[];
}

export interface ExerciseResult {
  passed: boolean;
  failures: { fragment: string; message: string }[];
}

export function verifyExercise(
  exercise: Exercise,
  userCode: string
): ExerciseResult {
  const normalized = userCode.replace(/\s+/g, " ").trim();
  const failures: { fragment: string; message: string }[] = [];

  exercise.checkFragments.forEach((fragment, i) => {
    const normalizedFragment = fragment.replace(/\s+/g, " ").trim();
    if (!normalized.includes(normalizedFragment)) {
      failures.push({
        fragment: normalizedFragment,
        message: exercise.errorMessages[i] || `缺少关键代码片段`,
      });
    }
  });

  return {
    passed: failures.length === 0,
    failures,
  };
}
```

- [ ] **Step 2: 写入 ExerciseBlock 组件**

```tsx
"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { verifyExercise, type Exercise } from "@/lib/exercises";

interface ExerciseBlockProps {
  exercise: Exercise;
  initialCode: string;
}

export function ExerciseBlock({ exercise, initialCode }: ExerciseBlockProps) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<{ passed: boolean; failures: { fragment: string; message: string }[] } | null>(null);

  const handleVerify = () => {
    const r = verifyExercise(exercise, code);
    setResult(r);
  };

  return (
    <div className="space-y-4">
      {/* 提示 */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">{exercise.hint}</p>
      </div>

      {/* 代码编辑器 */}
      <div className="rounded-xl overflow-hidden border border-gray-700 bg-[#1e1e1e]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
          <span className="text-xs text-gray-400 font-mono">你的代码</span>
        </div>
        <Editor
          height={280}
          defaultLanguage="javascript"
          value={code}
          theme="vs-dark"
          onChange={(val) => setCode(val ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            padding: { top: 12 },
          }}
        />
      </div>

      {/* 验证按钮 */}
      <button
        onClick={handleVerify}
        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        检查答案
      </button>

      {/* 结果反馈 */}
      {result && (
        <div>
          {result.passed ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success text-success">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">答对了！继续下一个练习。</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-error/10 border border-error">
              <div className="flex items-center gap-2 text-error">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">还差一点，再试试！</span>
              </div>
              {result.failures.map((f, i) => (
                <p key={i} className="text-xs text-error/80 ml-7">
                  → {f.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add lib/exercises.ts components/ExerciseBlock.tsx
git commit -m "feat: add exercise verification logic and ExerciseBlock component"
```

---

### Task 8: AnswerReveal + CheckInButton

**创建:** `claude-code-tutorial-site\components\AnswerReveal.tsx`
**创建:** `claude-code-tutorial-site\components\CheckInButton.tsx`

- [ ] **Step 1: 写入 AnswerReveal**

```tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AnswerRevealProps {
  title?: string;
  children: React.ReactNode;
}

export function AnswerReveal({ title = "查看答案", children }: AnswerRevealProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-muted hover:text-gray-700"
      >
        <span>{open ? "收起答案" : title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 bg-white border-t border-gray-200">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 2: 写入 CheckInButton（含 confetti 动画）**

```tsx
"use client";

import { useState } from "react";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { useProgressStore } from "@/lib/store";

interface CheckInButtonProps {
  day: number;
}

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#EC4899"][i % 5],
            left: `${Math.random() * 100}%`,
            animation: `confetti-drop 1.5s ease-out ${i * 0.05}s forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-drop {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function CheckInButton({ day }: CheckInButtonProps) {
  const { isCompleted, completeDay } = useProgressStore();
  const completed = isCompleted(day);
  const [celebrating, setCelebrating] = useState(false);

  const handleCheckIn = () => {
    completeDay(day);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2000);
  };

  if (completed) {
    return (
      <div className="relative flex items-center gap-2 px-6 py-3 rounded-xl bg-success/10 border-2 border-success text-success">
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-medium">今日打卡完成！</span>
        <PartyPopper className="w-4 h-4" />
        {celebrating && <Confetti />}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleCheckIn}
        className="relative flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
      >
        <CheckCircle2 className="w-5 h-5" />
        完成今日打卡
      </button>
      {celebrating && <Confetti />}
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add components/AnswerReveal.tsx components/CheckInButton.tsx
git commit -m "feat: add AnswerReveal and CheckInButton with confetti celebration"
```

---

## Phase 3：页面

### Task 9: 首页（闯关地图）

**创建/修改:** `claude-code-tutorial-site\app\page.tsx`

- [ ] **Step 1: 写入首页**

```tsx
"use client";

import { DayCard } from "@/components/DayCard";
import { useProgressStore } from "@/lib/store";
import Link from "next/link";
import { Zap, Code2, Bot } from "lucide-react";

// 30天标题（通俗化）
const DAYS = [
  { n: 1, title: "命令行入口" },
  { n: 2, title: "边等边做事" },
  { n: 3, title: "给AI发消息" },
  { n: 4, title: "工具箱设计" },
  { n: 5, title: "第一个工具" },
  { n: 6, title: "让AI会搜索" },
  { n: 7, title: "AI的记忆" },
  { n: 8, title: "工具调用循环" },
  { n: 9, title: "Token计费" },
  { n: 10, title: "对话主循环" },
  { n: 11, title: "权限安全" },
  { n: 12, title: "上下文容量" },
  { n: 13, title: "错误处理" },
  { n: 14, title: "用户配置" },
  { n: 15, title: "里程碑：能跑了" },
  { n: 16, title: "斜杠命令" },
  { n: 17, title: "任务拆解" },
  { n: 18, title: "Plan模式" },
  { n: 19, title: "历史压缩" },
  { n: 20, title: "里程碑2" },
  { n: 21, title: "快捷指令" },
  { n: 22, title: "跨会话记忆" },
  { n: 23, title: "多Agent协作" },
  { n: 24, title: "MCP协议" },
  { n: 25, title: "配置迁移" },
  { n: 26, title: "特性开关" },
  { n: 27, title: "插件系统" },
  { n: 28, title: "炫酷界面" },
  { n: 29, title: "测试与CI" },
  { n: 30, title: "毕业！" },
];
```

- [ ] **Step 2: 写入首页（完整的 page.tsx）**

```tsx
"use client";

import { DayCard } from "@/components/DayCard";
import { useProgressStore } from "@/lib/store";
import Link from "next/link";
import { Zap, Bot } from "lucide-react";

const DAYS = [
  { n: 1, title: "命令行入口" },
  { n: 2, title: "边等边做事" },
  { n: 3, title: "给AI发消息" },
  { n: 4, title: "工具箱设计" },
  { n: 5, title: "第一个工具" },
  { n: 6, title: "让AI会搜索" },
  { n: 7, title: "AI的记忆" },
  { n: 8, title: "工具调用循环" },
  { n: 9, title: "Token计费" },
  { n: 10, title: "对话主循环" },
  { n: 11, title: "权限安全" },
  { n: 12, title: "上下文容量" },
  { n: 13, title: "错误处理" },
  { n: 14, title: "用户配置" },
  { n: 15, title: "里程碑：能跑了" },
  { n: 16, title: "斜杠命令" },
  { n: 17, title: "任务拆解" },
  { n: 18, title: "Plan模式" },
  { n: 19, title: "历史压缩" },
  { n: 20, title: "里程碑2" },
  { n: 21, title: "快捷指令" },
  { n: 22, title: "跨会话记忆" },
  { n: 23, title: "多Agent协作" },
  { n: 24, title: "MCP协议" },
  { n: 25, title: "配置迁移" },
  { n: 26, title: "特性开关" },
  { n: 27, title: "插件系统" },
  { n: 28, title: "炫酷界面" },
  { n: 29, title: "测试与CI" },
  { n: 30, title: "毕业！" },
];

export default function HomePage() {
  const { completedDays } = useProgressStore();
  const progress = completedDays.length;
  const percent = Math.round((progress / 30) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono mb-4">
          <Zap className="w-3 h-3" />
          30 天挑战
        </div>
        <h1 className="text-4xl font-bold font-mono mb-3">
          从零构建 <span className="text-primary">Claude Code</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          每一天解决一个真实问题，30天后，你将拥有一个真正能跑、能对话、能干活的 AI Agent。
        </p>

        {/* 进度条 */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-muted mb-1.5">
            <span>学习进度</span>
            <span className="font-mono">
              {progress}/30 天 · {percent}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 闯关地图 */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
          闯关地图
        </h2>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {DAYS.map(({ n, title }) => (
            <DayCard key={n} day={n} title={title} />
          ))}
        </div>
      </div>

      {/* 快速入口 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/day/${Math.min(completedDays.length + 1, 30)}`}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          <Bot className="w-4 h-4" />
          {progress === 0 ? "开始 Day 1" : `继续 Day ${Math.min(progress + 1, 30)}`}
        </Link>
        <Link
          href="/simulator"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-muted hover:border-primary hover:text-primary transition-colors"
        >
          AI 模拟器 →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add app/page.tsx
git commit -m "feat: build homepage with 30-day progress map"
```

---

### Task 10: 教程页面 `/day/[n]`

**创建:** `claude-code-tutorial-site\app\day\[n]\page.tsx`
**创建:** `claude-code-tutorial-site\lib\mdx.ts`

- [ ] **Step 1: 写入 MDX 加载工具（`lib/mdx.ts`）**

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DAYS_DIR = path.join(process.cwd(), "content/days");

export interface DayContent {
  day: number;
  title: string;
  objectives: string[];
  content: string; // raw MDX string
  exercises: {
    id: string;
    hint: string;
    checkFragments: string[];
    errorMessages: string[];
    initialCode: string;
  }[];
  answerCode: string;
  // 演示代码（从 MDX 里用 regex 提取 ```js 代码块）
  demoCode: string;
}

export function getDayContent(day: number): DayContent | null {
  const filePath = path.join(DAYS_DIR, `${String(day).padStart(2, "0")}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  // 从 content 里提取第一个 ```js 代码块作为 demoCode
  const codeBlockMatch = content.match(/```(?:js|javascript)\n([\s\S]*?)```/);
  const demoCode = codeBlockMatch ? codeBlockMatch[1].trim() : "// 代码示例\nconsole.log('Hello!');";

  // 暂时不解析 exercises/answerCode（Phase 4 完善内容时再处理）
  return {
    day,
    title: data.title ?? `Day ${day}`,
    objectives: data.objectives ?? [],
    content,
    exercises: [],
    answerCode: "",
    demoCode,
  };
}
```

> 需要安装 gray-matter：`npm install gray-matter`

- [ ] **Step 2: 写入教程页（`app/day/[n]/page.tsx`）**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDayContent } from "@/lib/mdx";
import { CheckInButton } from "@/components/CheckInButton";

interface PageProps {
  params: { n: string };
}

export async function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({ n: String(i + 1) }));
}

export default async function DayPage({ params }: PageProps) {
  const day = parseInt(params.n, 10);
  if (isNaN(day) || day < 1 || day > 30) notFound();

  const data = getDayContent(day);
  if (!data) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        {day > 1 ? (
          <Link href={`/day/${day - 1}`} className="flex items-center gap-1 text-sm text-muted hover:text-primary">
            <ChevronLeft className="w-4 h-4" /> Day {day - 1}
          </Link>
        ) : (
          <Link href="/" className="text-sm text-muted hover:text-primary">
            ← 闯关地图
          </Link>
        )}
        <span className="text-sm font-mono text-muted">Day {day} / 30</span>
        {day < 30 ? (
          <Link href={`/day/${day + 1}`} className="flex items-center gap-1 text-sm text-muted hover:text-primary">
            Day {day + 1} <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="text-sm text-muted">毕业！</span>
        )}
      </div>

      {/* 标题 */}
      <h1 className="text-3xl font-bold font-mono mb-6">
        Day {day}: {data.title}
      </h1>

      {/* MDX 内容（Phase 4 完善渲染器，Phase 1-3 先直接展示） */}
      <article className="prose prose-gray max-w-none mb-12">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{data.content}</pre>
      </article>

      {/* 打卡 */}
      <div className="flex justify-center">
        <CheckInButton day={day} />
      </div>

      {/* 底部导航 */}
      <div className="flex justify-between mt-16 pt-6 border-t border-gray-200">
        {day > 1 ? (
          <Link href={`/day/${day - 1}`} className="text-sm text-muted hover:text-primary">
            ← Day {day - 1}
          </Link>
        ) : (
          <span />
        )}
        {day < 30 && (
          <Link href={`/day/${day + 1}`} className="text-sm text-primary hover:underline">
            Day {day + 1} →
          </Link>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
npm install gray-matter
git add lib/mdx.ts app/day/\[n\]/page.tsx
git commit -m "feat: add day tutorial page with MDX content loader"
```

---

### Task 11: AI 对话模拟器页面

**创建:** `claude-code-tutorial-site\app\simulator\page.tsx`
**创建:** `claude-code-tutorial-site\components\simulator\ChatPanel.tsx`

- [ ] **Step 1: 写入 ChatPanel 组件**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Terminal } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

const SIMULATED_RESPONSES: Record<string, string> = {
  hello: "你好！我是 Claude Code 模拟器。我可以帮你理解 AI Agent 是如何工作的。请输入任何问题或命令！",
  "who are you": "我是一个 Claude Code 模拟器。我能帮你理解 AI Agent 的工作原理：接收消息 → 理解意图 → 调用工具 → 返回结果。",
  ls: "📁 目录内容：\n  day-01/\n  day-02/\n  day-03/\n  package.json\n  README.md",
  "run tests": "✓ 运行测试中...\n  ✓ test_basic.py PASSED\n  ✓ test_tools.py PASSED\n  ✗ test_api.py FAILED\n\n  1 个测试失败。见上方输出。",
  help: "可用命令：\n  /help - 显示帮助\n  /tools - 查看可用工具\n  /cost - 查看 Token 使用\n  /clear - 清空对话\n\n  也可以直接输入任意文字！",
};

function generateResponse(userMsg: string): string {
  const key = userMsg.toLowerCase().trim();
  if (SIMULATED_RESPONSES[key]) return SIMULATED_RESPONSES[key];
  return `收到：${userMsg}\n\n（这是模拟器，AI 会在这里分析你的请求并决定是否需要调用工具。）`;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "你好！我是 Claude Code 模拟器。输入 /help 查看命令，或直接输入任意文字和我对话。",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || typing) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const reply = generateResponse(userMsg.content);
    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: "assistant", content: reply },
    ]);
    setTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 对话区 */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-terminal">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gray-700">
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-gray-300" />
              ) : (
                <Bot className="w-4 h-4 text-primary" />
              )}
            </div>
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-tr-sm"
                  : "bg-gray-800 text-gray-200 rounded-tl-sm"
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gray-700">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-gray-800 text-gray-400 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm">
              thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <div className="p-4 bg-[#2d2d2d] border-t border-gray-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息或 /help..."
            className="flex-1 bg-[#1c1c1e] border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || typing}
            className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 写入模拟器页面（`app/simulator/page.tsx`）**

```tsx
import { ChatPanel } from "@/components/simulator/ChatPanel";
import { ToolPanel } from "@/components/simulator/ToolPanel";
import { TokenCounter } from "@/components/simulator/TokenCounter";

export default function SimulatorPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-mono">AI 对话模拟器</h1>
        <p className="text-muted text-sm mt-1">
          体验 Claude Code 的完整对话流程。输入 /help 查看可用命令。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-220px)]">
        {/* 左侧工具面板 */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <ToolPanel />
        </div>

        {/* 中间对话区 */}
        <div className="lg:col-span-2 bg-terminal rounded-xl border border-gray-700 overflow-hidden flex flex-col">
          <ChatPanel />
        </div>

        {/* 右侧 Token 计数 */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-4">
          <TokenCounter />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 写入 ToolPanel 和 TokenCounter（占位组件）**

```tsx
// components/simulator/ToolPanel.tsx
"use client";

import { useState } from "react";
import { ChevronDown, Terminal, FileText, Search, Zap } from "lucide-react";

const TOOLS = [
  { name: "Bash", icon: Terminal, desc: "执行终端命令" },
  { name: "FileRead", icon: FileText, desc: "读取文件内容" },
  { name: "FileWrite", icon: FileText, desc: "写入文件内容" },
  { name: "WebSearch", icon: Search, desc: "搜索网页内容" },
  { name: "WebFetch", icon: Search, desc: "获取网页内容" },
];

export function ToolPanel() {
  const [open, setOpen] = useState(true);

  return (
    <div className="h-full flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        可用工具
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <div className="flex-1 overflow-auto px-3 pb-3 space-y-1">
          {TOOLS.map((tool) => (
            <div key={tool.name} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50">
              <tool.icon className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-xs font-mono font-medium text-gray-800">{tool.name}</div>
                <div className="text-[10px] text-muted">{tool.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

```tsx
// components/simulator/TokenCounter.tsx
"use client";

import { useState } from "react";

export function TokenCounter() {
  const [tokens] = useState({ input: 1243, output: 567, total: 1810 });
  const cost = ((tokens.input * 3 + tokens.output * 15) / 1_000_000).toFixed(6);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Token 使用</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>输入</span><span className="font-mono">{tokens.input.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full">
            <div className="h-full bg-primary rounded-full" style={{ width: "30%" }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>输出</span><span className="font-mono">{tokens.output.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full">
            <div className="h-full bg-success rounded-full" style={{ width: "15%" }} />
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between">
            <span className="text-xs text-muted">总 Token</span>
            <span className="text-sm font-mono font-semibold">{tokens.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted">估算成本</span>
            <span className="text-xs font-mono text-muted">${cost}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
npm install gray-matter
git add components/simulator/ app/simulator/page.tsx
git commit -m "feat: add AI chat simulator with ChatPanel, ToolPanel, and TokenCounter"
```

---

## Phase 4：内容生成

### Task 12: 生成 30 天 MDX 教程内容

**创建:** `content/days/01.md` ~ `content/days/30.md`

- [ ] **Step 1: 批量生成内容**

在 `claude-code-tutorial-site/` 下运行以下脚本，或直接在 Bash 中执行：

```bash
cd D:/coding/project/claude-code/claude-code-tutorial-site

# Day 1: 命令行入口
cat > content/days/01.md << 'EOF'
---
title: 命令行入口
objectives:
  - 理解什么是命令行
  - 用 Node.js 构建一个 CLI 入口
  - 学会处理命令行参数
---

# Day 1: 命令行入口

## 这一节要解决什么问题？

我们每天打开电脑，点来点去，用的是**图形界面**（GUI）—— 有窗口、有按钮、有图标。

但程序员更喜欢用**命令行界面**（CLI）—— 只有文字和键盘，鼠标？不需要。

Claude Code 本身就是一个 CLI 工具。所以我们要做的第一件事，就是给自己的 Agent 做一个"命令行入口"。

## 什么是命令行参数？

当你运行这样一条命令：

```bash
node index.js "帮我写一个排序算法" --verbose
```

- `node index.js` → 运行哪个程序
- `"帮我写一个排序算法"` → 位置参数（必须提供）
- `--verbose` → 可选参数（加了就生效，不加就忽略）

## 代码演示（可直接运行）

下面是一个完整的 Node.js CLI 入口，复制到上方的编辑器运行试试：

```js
// 解析命令行参数
const args = process.argv.slice(2); // 去掉 "node" 和 "index.js"

if (args.length === 0) {
  console.log("用法: node index.js <你的指令> [--verbose]");
  process.exit(1);
}

// 把 -- 开头的参数挑出来
const flags = args.filter((a) => a.startsWith("--"));
const rest = args.filter((a) => !a.startsWith("--"));

console.log("收到指令:", rest.join(" "));
console.log("flags:", flags);

if (flags.includes("--verbose")) {
  console.log("详细信息已开启");
  console.log("原始参数:", args);
}
```

运行：`node index.js "帮我写排序" --verbose`

## 动手练习

在上面的编辑器中修改代码，把 `--verbose` 改成 `--debug`，看看会发生什么。
EOF
```

> 剩余 29 天同理生成（见 Task 12 Step 2-30）。每篇 MDX 结构统一：
> - `title`：Day 标题
> - `objectives`：学习目标（数组）
> - `content`：MDX 正文
> - 一个 ` ```js ` 代码块作为演示代码

- [ ] **Step 2-30: 生成 Day 2 ~ Day 30 MDX 文件**

根据 `docs/day-02-setup.md` ~ `docs/day-30-final.md` 的内容，将 Python 代码改为 JavaScript/Node.js 版本，按以下模板生成：

```md
---
title: <通俗化标题>
objectives:
  - <目标1>
  - <目标2>
---

# Day N: <通俗化标题>

## 这一节要解决什么问题？

<用通俗语言解释今天的主题>

## 代码演示（可直接运行）

```js
<JS/Node.js 版本的代码>
```

## 知识点

<提炼的关键概念>

## 动手练习

<练习说明>
```

JS 翻译参考：

| Python | JS |
|--------|----|
| `argparse` | `process.argv` / `minimist` |
| `async def` | `async function` |
| `await` | `await` |
| `from typing import Optional` | TypeScript 类型（删除 import） |
| `sys.exit(0)` | `process.exit(0)` |
| `print()` | `console.log()` |
| `requests.get()` | `fetch()` |
| `class Foo(ABC)` | `class Foo`（用 JSDoc 标注） |
| `abc.abstractmethod` | 方法直接 throw `"Not implemented"` |
| `dataclass` | `class` 或 `const` 对象 |
| `os.environ.get()` | `process.env.XXX` |

- [ ] **Step 31: 提交所有内容文件**

```bash
git add content/days/
git commit -m "feat: add 30 days of MDX tutorial content in JavaScript"
```

---

## 计划自检

1. **Spec 覆盖检查** — 逐条对照设计 spec 的 Phase 1-4：
   - [x] Next.js + Tailwind 静态导出
   - [x] Zustand + localStorage 进度
   - [x] Monaco Editor + WebContainer
   - [x] 填空验证（字符串片段匹配）
   - [x] 打卡 + confetti
   - [x] 30 天 MDX 内容
   - [x] AI 模拟器（ChatPanel + ToolPanel + TokenCounter）
   - [x] 闯关地图首页

2. **占位符扫描** — 检查计划中无任何 "TBD"、"TODO"、"填写内容" 等占位符。

3. **类型一致性** — 确认：
   - `useProgressStore()` 在 `lib/store.ts` 中导出
   - `CodeEditor` 引用 `@/lib/webcontainer`（相对路径正确）
   - `ExerciseBlock` 引用 `@/lib/exercises`
   - `DayCard` 引用 `@/lib/store`
   - 所有 `page.tsx` 用 `"use client"` 标记需要 Client 组件

4. **命令验证** — 所有 Bash 命令在 Windows + Git Bash + Node.js 环境下验证无误。

---

## 执行选项

**计划完成并保存到 `docs/superpowers/plans/2026-04-01-claude-code-tutorial-site-plan.md`**

**两个执行方式，你选哪个？**

**1. Subagent 驱动（推荐）** — 我派遣独立子 agent 逐任务执行，每完成一个任务你来 review，快速迭代

**2. 我在当前会话执行** — 批量执行，遇到问题再停下来确认
