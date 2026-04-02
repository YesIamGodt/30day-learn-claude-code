import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DAYS_DIR = path.join(process.cwd(), "content/days");

export interface DayContent {
  day: number;
  title: string;
  objectives: string[];
  content: string;
  demoCode: string;
  exercises: {
    id: string;
    hint: string;
    checkFragments: string[];
    errorMessages: string[];
    initialCode: string;
  }[];
  sourceFiles: {
    path: string;
    title: string;
    explainer: string;
  }[];
}

export function getDayContent(day: number): DayContent | null {
  const filePath = path.join(DAYS_DIR, `${String(day).padStart(2, "0")}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  // 提取 ```js 代码块作为演示代码（取最后一个，完整 Demo 在底部）
  const codeBlocks = Array.from(content.matchAll(/```(?:js|javascript)\n([\s\S]*?)```/g));
  const demoCode =
    codeBlocks.length > 0
      ? codeBlocks[codeBlocks.length - 1][1].trim()
      : "// 代码示例\nconsole.log('Hello!');";

  return {
    day,
    title: data.title ?? `Day ${day}`,
    objectives: data.objectives ?? [],
    content,
    demoCode,
    exercises: [],
    sourceFiles: data.sourceFiles ?? [],
  };
}
