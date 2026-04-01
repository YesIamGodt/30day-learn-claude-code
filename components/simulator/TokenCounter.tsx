"use client";

import { useState } from "react";

export function TokenCounter() {
  const [tokens] = useState({ input: 1243, output: 567, total: 1810 });
  const cost = ((tokens.input * 3 + tokens.output * 15) / 1_000_000).toFixed(6);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Token 使用</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>输入</span>
            <span className="font-mono">{tokens.input.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: "30%" }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>输出</span>
            <span className="font-mono">{tokens.output.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full">
            <div
              className="h-full bg-success rounded-full"
              style={{ width: "15%" }}
            />
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between">
            <span className="text-xs text-muted">总 Token</span>
            <span className="text-sm font-mono font-semibold">
              {tokens.total.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted">估算成本</span>
            <span className="text-xs font-mono text-muted">${cost}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
