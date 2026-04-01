import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressStore {
  completedDays: number[];
  currentDay: number;
  completeDay: (day: number) => void;
  isCompleted: (day: number) => boolean;
  reset: () => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      completedDays: [],
      currentDay: 1,

      completeDay: (day: number) => {
        const { completedDays } = get();
        if (!completedDays.includes(day)) {
          set({ completedDays: [...completedDays, day] });
        }
      },

      isCompleted: (day: number) => {
        return get().completedDays.includes(day);
      },

      reset: () => set({ completedDays: [], currentDay: 1 }),
    }),
    {
      name: "claude-tutorial-progress",
    }
  )
);
