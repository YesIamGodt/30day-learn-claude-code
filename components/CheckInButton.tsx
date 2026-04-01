"use client";

import { useState } from "react";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { useProgressStore } from "@/lib/store";

interface CheckInButtonProps {
  day: number;
}

const CONFETTI_COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#EC4899"];

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
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
