"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayContent } from "@/components/DayContent";
import { CheckInButton } from "@/components/CheckInButton";
import { SourceCodePanel, SourceFile } from "@/components/SourceCodePanel";

interface DayPageClientProps {
  day: number;
  title: string;
  objectives: string[];
  rawContent: string;
  demoCode: string;
  sourceFiles?: SourceFile[];
}

export function DayPageClient({
  day,
  title,
  objectives,
  rawContent,
  demoCode,
  sourceFiles,
}: DayPageClientProps) {
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-warm">
      {/* Top header bar */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-muted">Day {day} / 30</span>
          <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">← 闯关地图</Link>
        </div>
      </div>

      {/* Two-column main content */}
      <div className="max-w-[1400px] mx-auto px-6 pb-16 flex gap-6 items-start">
        {/* Left: Tutorial content */}
        <div className="flex-1 min-w-0">
          {/* Day navigation */}
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

          {/* Title */}
          <h1 className="text-3xl font-bold font-mono mb-3">Day {day}: {title}</h1>

          {/* Objectives */}
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

          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-12">
            <DayContent rawContent={rawContent} demoCode={demoCode} />
          </div>

          {/* Check-in */}
          <div className="flex justify-center mt-8 pt-8 border-t border-gray-200">
            <CheckInButton day={day} />
          </div>
        </div>

        {/* Right: Source panel */}
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
}
