"""day-15/main.py — 里程碑一：最小可用 CLI"""
import asyncio
import argparse
import os
import sys
from pathlib import Path

# 确保 src 目录在路径中
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from anthropic import Anthropic
from history import ConversationHistory
from token_counter import TokenCounter
from context import ContextManager
from engine import QueryEngine
from permission import PermissionSystem
from config import Config
from tools.registry import get_registry
from tools.bash import BashTool
from tools.file_read import FileReadTool
from tools.file_write import FileWriteTool


class ClaudeApp:
    def __init__(self, config: Config):
        self.config = config
        self.client = Anthropic(api_key=config.api_key)
        self.history = ConversationHistory()
        self.counter = TokenCounter()
        self.ctx = ContextManager()
        self.permissions = PermissionSystem(auto_approve=config.permission_auto_approve)
        registry = get_registry()
        registry.clear()
        registry.register(BashTool())
        registry.register(FileReadTool())
        registry.register(FileWriteTool())
        self.engine = QueryEngine(client=self.client, history=self.history)

    async def run(self, prompt: str):
        system = self.ctx.build_system_prompt()
        self.history.add_message("system", system)
        result = await self.engine.run(prompt)
        print(f"Claude: {result}")
        print(f"\n{self.counter.summary()}")

    async def repl(self):
        print("Claude Code — REPL 模式")
        print("输入 /help 查看命令，/exit 退出\n")
        while True:
            try:
                user_input = input("你: ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not user_input:
                continue
            if user_input.lower() in ("/exit", "/quit"):
                break
            if user_input == "/help":
                print("/help, /exit, /clear, /cost, /context")
                continue
            if user_input == "/clear":
                self.history.clear()
                print("历史已清空")
                continue
            if user_input == "/cost":
                print(self.counter.summary())
                continue
            if user_input == "/context":
                print(self.ctx.build_system_prompt())
                continue
            try:
                result = await self.engine.run(user_input)
                print(f"Claude: {result}\n")
            except Exception as e:
                print(f"错误: {e}")


def main():
    parser = argparse.ArgumentParser(description="Claude Code — 最小可用 CLI")
    parser.add_argument("prompt", nargs="?", help="要执行的任务")
    parser.add_argument("--repl", action="store_true", help="进入 REPL 模式")
    args = parser.parse_args()

    config = Config.load()
    if not config.api_key:
        config.api_key = os.environ.get("ANTHROPIC_API_KEY", "")

    app = ClaudeApp(config)

    if args.repl or not args.prompt:
        asyncio.run(app.repl())
    else:
        asyncio.run(app.run(args.prompt))


if __name__ == "__main__":
    main()
