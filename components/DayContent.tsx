"use client";

import React from "react";
import { CodeEditor } from "@/components/CodeEditor";

interface DayContentProps {
  rawContent: string;
  demoCode: string;
}

/** 简单的 Markdown → JSX 解析器 */
function parseMarkdown(raw: string, demoCode: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = raw.split("\n");
  let i = 0;

  // 计算 ```js/jscript 代码块的数量，跳过最后一个（它会在 CodeEditor 中展示）
  const jsBlockCount = (raw.match(/```(?:js|javascript)\n[\s\S]*?```/g) ?? []).length;
  let jsBlockIndex = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 跳过 frontmatter
    if (line.trim() === "---") {
      i++;
      while (i < lines.length && lines[i].trim() !== "---") i++;
      i++;
      continue;
    }

    // 代码块
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).toLowerCase();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```

      // 最后一个 js/code 代码块由 CodeEditor 展示，跳过
      if ((lang === "js" || lang === "javascript")) {
        jsBlockIndex++;
        if (jsBlockIndex === jsBlockCount) continue;
      }

      const codeText = codeLines.join("\n");
      nodes.push(
        <pre
          key={`code-${i}`}
          className="bg-[#1e1e1e] text-green-400 rounded-xl p-4 overflow-x-auto text-sm font-mono my-4"
        >
          {codeText}
        </pre>
      );
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      nodes.push(
        <h1 key={`h1-${i}`} className="text-2xl font-bold mt-8 mb-4">
          {renderInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={`h2-${i}`} className="text-xl font-semibold mt-8 mb-3">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${i}`} className="text-lg font-semibold mt-6 mb-2">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // 无序列表
    if (line.match(/^[-*] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-3 text-gray-700">
          {listItems.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // 有序列表
    if (line.match(/^\d+\. /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-3 text-gray-700">
          {listItems.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // 空行
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 普通段落
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].match(/^[-*] /) &&
      !lines[i].match(/^\d+\. /)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      nodes.push(
        <p key={`p-${i}`} className="text-gray-700 leading-relaxed my-3">
          {renderInline(paraLines.join(" "))}
        </p>
      );
    }
  }

  return nodes;
}

/** 处理行内格式：加粗、斜体、行内代码、链接 */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // 行内代码 `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={`ic-${parts.length}`}
          className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 加粗 **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={`b-${parts.length}`} className="font-semibold">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 斜体 *text*
    const emMatch = remaining.match(/^\*([^*]+)\*/);
    if (emMatch) {
      parts.push(
        <em key={`e-${parts.length}`} className="italic">
          {emMatch[1]}
        </em>
      );
      remaining = remaining.slice(emMatch[0].length);
      continue;
    }

    // 普通字符 → 到下一个特殊字符为止
    const nextSpecial = remaining.search(/[`*]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // 孤立的特殊字符，直接保留
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}

export function DayContent({ rawContent, demoCode }: DayContentProps) {
  const blocks = parseMarkdown(rawContent, demoCode);

  return (
    <article className="space-y-1">
      {blocks}
      {demoCode && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">代码演示（可直接运行）</h2>
          <CodeEditor code={demoCode} height={320} />
        </div>
      )}
    </article>
  );
}
