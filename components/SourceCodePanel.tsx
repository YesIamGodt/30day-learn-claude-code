"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { FileCode, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export interface SourceFile {
  path: string;       // relative to src/, e.g. "tools/bash.py"
  title: string;      // display title, e.g. "BashTool 实现"
  content: string;    // file content
  explainer: string;   // Markdown explanation content
}

interface SourceCodePanelProps {
  files: SourceFile[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// SourceExplainer: renders Markdown (H2/H3, tables, code blocks, paragraphs)
function SourceExplainer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block: ```...```
    if (line.trimStart().startsWith("```")) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre
          key={i}
          className="bg-[#1e1e1e] text-green-400 rounded-lg p-4 my-3 text-sm font-mono overflow-x-auto"
        >
          {codeLines.join("\n")}
        </pre>
      );
      i++; // skip closing ```
      continue;
    }

    // H2 heading
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-lg font-bold text-gray-800 mt-6 mb-2"
        >
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // H3 heading
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="text-base font-bold text-gray-800 mt-4 mb-1.5"
        >
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // Table row: detect lines with | that are not separator rows
    if (line.includes("|") && line.trim().startsWith("|")) {
      const cells = line.split("|").filter((c) => c.trim() !== "");
      // Skip separator rows like |---|---|
      if (!cells.every((c) => /^[-:\s]+$/.test(c.trim()))) {
        const isHeader = elements.length === 0 ||
          (elements[elements.length - 1] !== null &&
            !String(elements[elements.length - 1]).includes("</tr>"));

        const rowClass = isHeader
          ? "bg-gray-100 font-semibold text-gray-800"
          : "border-t border-gray-200 text-gray-600";

        elements.push(
          <div
            key={i}
            className={`flex gap-2 px-3 py-2 text-sm ${rowClass}`}
            style={{ display: "flex", gap: "0.5rem" }}
          >
            {cells.map((cell, ci) => (
              <span
                key={ci}
                className="flex-1"
                style={{ flex: 1, minWidth: 0 }}
              >
                {cell.trim()}
              </span>
            ))}
          </div>
        );
      }
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph: collect consecutive non-empty non-heading lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("### ") &&
      !lines[i].includes("|") &&
      !lines[i].trimStart().startsWith("```")
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      elements.push(
        <p
          key={i}
          className="text-sm text-gray-600 leading-relaxed my-2"
        >
          {paraLines.join(" ")}
        </p>
      );
    }
  }

  return <div>{elements}</div>;
}

export function SourceCodePanel({
  files,
  collapsed,
  onToggleCollapse,
}: SourceCodePanelProps) {
  const [activeTab, setActiveTab] = useState<"source" | "explainer">("source");
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (files.length === 0) return null;

  const currentFile = files[selectedIndex];

  return (
    <div
      className={`shrink-0 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white transition-all duration-300 ${
        collapsed ? "w-12" : "w-[480px]"
      }`}
    >
      {/* Collapse/expand toggle button */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center w-full h-12 hover:bg-gray-100 transition-colors text-gray-500"
        title={collapsed ? "展开源码面板" : "收起源码面板"}
      >
        {collapsed ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {!collapsed && (
        <>
          {/* Tab bar */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab("source")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm transition-colors ${
                activeTab === "source"
                  ? "text-primary border-b-2 border-primary bg-white font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileCode className="w-4 h-4" />
              源码
            </button>
            <button
              onClick={() => setActiveTab("explainer")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm transition-colors ${
                activeTab === "explainer"
                  ? "text-primary border-b-2 border-primary bg-white font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              详解
            </button>
          </div>

          {/* File selector (only when multiple files) */}
          {files.length > 1 && (
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {files.map((file, idx) => (
                  <option key={file.path} value={idx}>
                    {file.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 overflow-auto">
            {activeTab === "source" && (
              <Editor
                height="100%"
                defaultLanguage="python"
                value={currentFile.content}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 12 },
                  domReadOnly: true,
                }}
              />
            )}
            {activeTab === "explainer" && (
              <div className="p-4">
                <SourceExplainer content={currentFile.explainer} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
