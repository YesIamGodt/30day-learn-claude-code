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
