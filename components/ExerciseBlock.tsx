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
  const [result, setResult] = useState<{
    passed: boolean;
    failures: { fragment: string; message: string }[];
  } | null>(null);

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
