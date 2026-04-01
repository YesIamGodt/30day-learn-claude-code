"""main.py — Day 4: 工具系统演示"""

import asyncio
from tools.base import BaseTool
from tools.registry import get_registry


class HelloTool(BaseTool[str, str]):
    """示例工具：返回问候语"""

    @property
    def name(self) -> str:
        return "hello"

    @property
    def description(self) -> str:
        return "返回一个问候语，输入名字返回 'Hello, {名字}!'"

    async def execute(self, input_data: str) -> str:
        return f"Hello, {input_data}!"


async def main():
    registry = get_registry()
    registry.clear()

    hello = HelloTool()
    registry.register(hello)

    print("已注册工具:", [t.name for t in registry.list_tools()])

    tool = registry.get("hello")
    result = await tool.execute("Claude")
    print(f"执行结果: {result}")


if __name__ == "__main__":
    asyncio.run(main())
