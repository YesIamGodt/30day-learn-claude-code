# Day 10: REPL 主循环 — 交互式对话界面

## 目标

今天我们将实现 Claude Code 的主交互界面：REPL（Read-Eval-Print Loop）。这是用户与 Claude Code 对话的主要方式——输入命令，AI 回复，循环往复。

学完今天后，你将能：
- 实现一个完整的 REPL 交互循环
- 处理特殊命令（如 /help、/exit、/clear）
- 实现历史记录和命令历史翻页

## 作业

### 题目 1：实现 REPL 类
在 REPL 类中实现主循环和命令处理。

### 题目 2：添加 /clear 命令
清空对话历史。

### 题目 3：添加 /cost 命令
显示 Token 使用统计。

## 答案解析

<details>
<summary>点击展开 Day 10 答案</summary>

### repl.py 完整实现

```python
"""repl.py"""
import asyncio
import os
from history import ConversationHistory
from engine import QueryEngine
from token_counter import TokenCounter
from anthropic import Anthropic
from tools.registry import get_registry
from tools.bash import BashTool

class REPL:
    def __init__(self):
        self.history = ConversationHistory()
        self.counter = TokenCounter()
        client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", "sk-test"))
        registry = get_registry()
        registry.clear()
        registry.register(BashTool())
        self.engine = QueryEngine(client=client, history=self.history)

    async def run(self):
        print("Claude Code — REPL 对话")
        print("输入消息与 Claude 对话，输入 /help 查看命令，/exit 退出\n")
        while True:
            try:
                user_input = input("你: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\n再见!")
                break
            if not user_input:
                continue
            if user_input.lower() in ("/exit", "/quit", "/q"):
                print("再见!")
                break
            if user_input == "/help":
                print("可用命令: /help, /exit, /clear, /cost, /history")
                continue
            if user_input == "/clear":
                self.history.clear()
                print("历史已清空")
                continue
            if user_input == "/cost":
                print(self.counter.summary())
                continue
            try:
                response = await self.engine.run(user_input)
                print(f"Claude: {response}\n")
            except Exception as e:
                print(f"错误: {e}")

if __name__ == "__main__":
    asyncio.run(REPL().run())
```

</details>

## 延伸阅读

- [Python REPL 设计模式](https://realpython.com/python-repl/)
