"""tools/file_read.py — FileReadTool: 读取文件内容"""

import asyncio
from pathlib import Path
from tools.base import BaseTool


class FileReadTool(BaseTool[str, str]):
    """读取文件内容"""

    @property
    def name(self) -> str:
        return "file_read"

    @property
    def description(self) -> str:
        return "读取指定路径的文件内容，以字符串返回"

    async def execute(self, path: str) -> str:
        """异步读取文件，带安全检查"""
        resolved = Path(path).resolve()
        cwd = Path.cwd().resolve()
        if not str(resolved).startswith(str(cwd)):
            return f"错误: 禁止访问工作目录之外的文件: {path}"

        try:
            return await asyncio.to_thread(Path(path).read_text)
        except FileNotFoundError:
            return f"错误: 文件不存在: {path}"
        except PermissionError:
            return f"错误: 无权读取: {path}"
