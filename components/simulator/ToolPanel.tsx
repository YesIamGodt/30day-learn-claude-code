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
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="flex-1 overflow-auto px-3 pb-3 space-y-1">
          {TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50"
            >
              <tool.icon className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-xs font-mono font-medium text-gray-800">
                  {tool.name}
                </div>
                <div className="text-[10px] text-muted">{tool.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
