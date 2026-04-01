"""tools/file_write.py — FileWriteTool: 写入文件"""

import asyncio
from pathlib import Path
from tools.base import BaseTool


class FileWriteTool(BaseTool[tuple[str, str], str]):
    """写入文件，参数为 (路径, 内容) 元组"""

    @property
    def name(self) -> str:
        return "file_write"

    @property
    def description(self) -> str:
        return "创建或覆写文件，写入指定内容"

    async def execute(self, args: tuple[str, str]) -> str:
        """异步写入文件"""
        path, content = args
        resolved = Path(path).resolve()
        cwd = Path.cwd().resolve()
        if not str(resolved).startswith(str(cwd)):
            return f"错误: 禁止访问工作目录之外的文件: {path}"

        await asyncio.to_thread(Path(path).write_text, content)
        return f"成功写入 {path}，共 {len(content)} 字符"
