"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayContent } from "@/components/DayContent";
import { CheckInButton } from "@/components/CheckInButton";

interface DayPageClientProps {
  day: number;
  title: string;
  objectives: string[];
  rawContent: string;
  demoCode: string;
}

export function DayPageClient({
  day,
  title,
  objectives,
  rawContent,
  demoCode,
}: DayPageClientProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        {day > 1 ? (
          <Link
            href={`/day/${day - 1}`}
            className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Day {day - 1}
          </Link>
        ) : (
          <Link
            href="/"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            ← 闯关地图
          </Link>
        )}
        <span className="text-sm font-mono text-muted">Day {day} / 30</span>
        {day < 30 ? (
          <Link
            href={`/day/${day + 1}`}
            className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors"
          >
            Day {day + 1} <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="text-sm text-muted">毕业！</span>
        )}
      </div>

      {/* 标题 */}
      <h1 className="text-3xl font-bold font-mono mb-2">
        Day {day}: {title}
      </h1>

      {/* 学习目标 */}
      {objectives.length > 0 && (
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            学习目标
          </h2>
          <ul className="space-y-2">
            {objectives.map((obj, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-gray-700"
              >
                <span className="text-primary mt-0.5 shrink-0 font-bold">✓</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 正文内容（含代码编辑器） */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-12">
        <DayContent rawContent={rawContent} demoCode={demoCode} />
      </div>

      {/* 打卡 */}
      <div className="flex justify-center mt-8 pt-8 border-t border-gray-200">
        <CheckInButton day={day} />
      </div>

      {/* 底部导航 */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        {day > 1 ? (
          <Link
            href={`/day/${day - 1}`}
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            ← Day {day - 1}
          </Link>
        ) : (
          <span />
        )}
        {day < 30 && (
          <Link
            href={`/day/${day + 1}`}
            className="text-sm text-primary hover:underline transition-colors"
          >
            Day {day + 1} →
          </Link>
        )}
      </div>
    </div>
  );
}
