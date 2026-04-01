"""main.py — Day 8: 工具调用循环演示"""

import asyncio
import os
from anthropic import Anthropic
from engine import QueryEngine
from history import ConversationHistory
from tools.registry import get_registry
from tools.bash import BashTool


async def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY", "sk-test")
    client = Anthropic(api_key=api_key)
    history = ConversationHistory()
    registry = get_registry()
    registry.clear()
    registry.register(BashTool())

    engine = QueryEngine(client=client, history=history)

    print("Claude Code — 工具调用演示")
    print("=" * 50)

    prompt = "请执行 `echo 'Hello, Claude!'` 命令"
    print(f"用户: {prompt}")

    result = await engine.run(prompt)
    print(f"\nClaude: {result}")


if __name__ == "__main__":
    asyncio.run(main())
