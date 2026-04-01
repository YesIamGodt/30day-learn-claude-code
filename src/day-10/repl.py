"""repl.py — REPL 主循环"""
import asyncio
import os
from history import ConversationHistory
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
                print("可用命令: /help, /exit, /clear, /cost")
                continue
            if user_input == "/clear":
                self.history.clear()
                print("历史已清空")
                continue
            if user_input == "/cost":
                print(self.counter.summary())
                continue
            print(f"[模拟 AI 回复]: {user_input}")

if __name__ == "__main__":
    asyncio.run(REPL().run())
