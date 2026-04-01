"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SIMULATED_RESPONSES: Record<string, string> = {
  hello: "你好！我是 Claude Code 模拟器。我可以帮你理解 AI Agent 是如何工作的。请输入任何问题或命令！",
  help: "可用命令：\n  /help - 显示帮助\n  /tools - 查看可用工具\n  /cost - 查看 Token 使用\n  /clear - 清空对话\n\n也可以直接输入任意文字！",
  "who are you": "我是一个 Claude Code 模拟器。我能帮你理解 AI Agent 的工作原理：接收消息 → 理解意图 → 调用工具 → 返回结果。",
  ls: "📁 目录内容：\n  day-01/\n  day-02/\n  package.json\n  README.md",
  "run tests": "✓ 运行测试中...\n  ✓ test_basic.py PASSED\n  ✓ test_tools.py PASSED\n  ✗ test_api.py FAILED\n\n  1 个测试失败。",
};

function generateResponse(userMsg: string): string {
  const key = userMsg.toLowerCase().trim();
  if (SIMULATED_RESPONSES[key]) return SIMULATED_RESPONSES[key];
  if (userMsg.toLowerCase().startsWith("/")) {
    return `未知命令：${userMsg}。输入 /help 查看所有命令。`;
  }
  return `收到：${userMsg}\n\n（这是模拟器，AI 会在这里分析你的请求并决定是否需要调用工具。）`;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "你好！我是 Claude Code 模拟器。输入 /help 查看命令，或直接输入任意文字和我对话。",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || typing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const reply = generateResponse(userMsg.content);
    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: "assistant", content: reply },
    ]);
    setTyping(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 对话区 */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-terminal">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gray-700">
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-gray-300" />
              ) : (
                <Bot className="w-4 h-4 text-primary" />
              )}
            </div>
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-tr-sm"
                  : "bg-gray-800 text-gray-200 rounded-tl-sm"
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gray-700">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-gray-800 text-gray-400 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm">
              thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <div className="p-4 bg-[#2d2d2d] border-t border-gray-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入消息或 /help..."
            className="flex-1 bg-[#1c1c1e] border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || typing}
            className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
