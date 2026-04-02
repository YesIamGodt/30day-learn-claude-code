"use client";

import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
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
    setTimeout(() => {
      outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
    }, 10);
  };

  const handleRun = () => {
    setRunning(true);
    setOutput("");

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
      if (logs.length === 0) {
        appendOutput("(无输出)\n");
      } else {
        logs.forEach((l) => appendOutput(l + "\n"));
      }
    } catch (e: unknown) {
      appendOutput(`[错误] ${String(e)}\n`);
    }

    setRunning(false);
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
          className="flex items-center gap-1.5 text-xs px-3 py-1 rounded bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {running ? "运行中..." : "运行代码"}
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
