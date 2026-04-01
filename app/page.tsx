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
