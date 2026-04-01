"use client";

import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Play, Trash2, Loader2 } from "lucide-react";

interface CodeEditorProps {
  code: string;
  readOnly?: boolean;
  height?: number;
}

type RunMode = "local" | "webcontainer" | "idle";

function runLocal(code: string, onOutput: (text: string) => void) {
  const logs: string[] = [];
  const mockConsole = {
    log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
    error: (...args: unknown[]) => logs.push("[error] " + args.map(String).join(" ")),
    warn: (...args: unknown[]) => logs.push("[warn] " + args.map(String).join(" ")),
    info: (...args: unknown[]) => logs.push("[info] " + args.map(String).join(" ")),
  };

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("console", code);
    fn(mockConsole);
    if (logs.length === 0) logs.push("(无输出)");
    logs.forEach((l) => onOutput(l + "\n"));
  } catch (e: unknown) {
    const err = e as Error;
    const msg = err.message || String(e);
    if (msg.includes("require") || msg.includes("process") || msg.includes("fetch")) {
      onOutput(
        `[提示] 这段代码使用了 Node.js/Browser 特有 API，\n` +
        `本地模式无法执行。换用 --运行WebContainer-- 模式。\n` +
        `[本地错误] ${msg}`
      );
    } else {
      onOutput(`[错误] ${msg}\n`);
    }
  }
}

async function runWebContainer(
  code: string,
  onOutput: (text: string) => void
): Promise<void> {
  try {
    const { bootWebContainer, runCode } = await import("@/lib/webcontainer");
    await bootWebContainer();
    await runCode(code, onOutput);
  } catch (e: unknown) {
    onOutput(`[WebContainer 错误] ${String(e)}\n`);
  }
}

export function CodeEditor({ code, readOnly = false, height = 300 }: CodeEditorProps) {
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<RunMode>("idle");
  const outputRef = useRef<HTMLPreElement>(null);

  const appendOutput = (text: string) => {
    setOutput((prev) => prev + text);
    setTimeout(() => {
      outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
    }, 10);
  };

  const handleRun = async (runMode: RunMode = "local") => {
    setRunning(true);
    setOutput("");
    setMode(runMode);
    appendOutput(`> ${runMode === "webcontainer" ? "WebContainer 模式运行中...\n" : "本地模式运行中...\n"}`);

    if (runMode === "webcontainer") {
      await runWebContainer(code, appendOutput);
    } else {
      runLocal(code, appendOutput);
    }

    setRunning(false);
    setMode("idle");
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRun("local")}
            disabled={running}
            title="本地 JS 模式（快速，标准 API）"
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {running && mode === "local" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            本地运行
          </button>
          <button
            onClick={() => handleRun("webcontainer")}
            disabled={running}
            title="WebContainer 模式（支持 Node.js API，如 require/process）"
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors disabled:opacity-50 border border-primary/30"
          >
            {running && mode === "webcontainer" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            WebContainer
          </button>
        </div>
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
      />

      {/* 输出面板 */}
      {output && (
        <div className="border-t border-gray-700">
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#2d2d2d]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">输出</span>
              {mode === "local" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                  本地 JS
                </span>
              )}
              {mode === "webcontainer" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                  WebContainer
                </span>
              )}
            </div>
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
