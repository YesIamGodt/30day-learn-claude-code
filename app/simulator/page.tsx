import { ChatPanel } from "@/components/simulator/ChatPanel";
import { ToolPanel } from "@/components/simulator/ToolPanel";
import { TokenCounter } from "@/components/simulator/TokenCounter";

export default function SimulatorPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-mono">AI 对话模拟器</h1>
        <p className="text-muted text-sm mt-1">
          体验 Claude Code 的完整对话流程。输入 /help 查看可用命令。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-220px)]">
        {/* 左侧工具面板 */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <ToolPanel />
        </div>

        {/* 中间对话区 */}
        <div className="lg:col-span-2 bg-terminal rounded-xl border border-gray-700 overflow-hidden flex flex-col">
          <ChatPanel />
        </div>

        {/* 右侧 Token 计数 */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-4">
          <TokenCounter />
        </div>
      </div>
    </div>
  );
}
