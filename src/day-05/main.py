"""main.py — Day 5: 工具演示"""

import asyncio
from tools.registry import get_registry
from tools.bash import BashTool
from tools.file_read import FileReadTool
from tools.file_write import FileWriteTool


async def main():
    registry = get_registry()
    registry.clear()

    registry.register(BashTool())
    registry.register(FileReadTool())
    registry.register(FileWriteTool())

    print("已注册工具:", [t.name for t in registry.list_tools()])
    print()

    bash = registry.get("bash")
    result = await bash.execute("echo 'Hello from BashTool!'")
    print(f"BashTool: {result}")

    write_tool = registry.get("file_write")
    await write_tool.execute(("demo.txt", "Hello, Claude Code!\n"))
    print("FileWriteTool: demo.txt 已写入")

    read_tool = registry.get("file_read")
    content = await read_tool.execute("demo.txt")
    print(f"FileReadTool: {content.strip()}")


if __name__ == "__main__":
    asyncio.run(main())
