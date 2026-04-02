import fs from "fs";
import path from "path";
import { getDayContent } from "./mdx";

export interface SourceFile {
  path: string;       // relative to src/, e.g. "tools/bash.py"
  title: string;      // display title
  content: string;    // file content
  explainer: string;   // Markdown explanation
}

export function readSourceFile(relativePath: string): string | null {
  const filePath = path.join(process.cwd(), "src", relativePath);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export function getSourceFiles(day: number): SourceFile[] {
  const data = getDayContent(day);
  if (!data?.sourceFiles || data.sourceFiles.length === 0) return [];

  return data.sourceFiles.map(sf => {
    const content = readSourceFile(sf.path) ?? `// 文件未找到: ${sf.path}`;
    return {
      path: sf.path,
      title: sf.title,
      content,
      explainer: sf.explainer ?? "",
    };
  });
}
