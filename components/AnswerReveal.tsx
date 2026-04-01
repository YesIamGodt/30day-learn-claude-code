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
        {open ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {open && (
        <div className="p-4 bg-white border-t border-gray-200">{children}</div>
      )}
    </div>
  );
}
