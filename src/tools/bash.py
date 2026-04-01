"""tools/bash.py — BashTool: 执行 shell 命令"""

import asyncio
from tools.base import BaseTool


class BashTool(BaseTool[str, str]):
    """执行 shell 命令并返回输出"""

    @property
    def name(self) -> str:
        return "bash"

    @property
    def description(self) -> str:
        return "执行 shell 命令，返回 stdout 和 stderr 的组合输出"

    async def execute(self, command: str, timeout: int = 30) -> str:
        """异步执行命令，带超时控制"""
        try:
            proc = await asyncio.wait_for(
                asyncio.create_subprocess_shell(
                    command,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                ),
                timeout=timeout,
            )
            stdout, stderr = await proc.communicate()
            return stdout.decode() + stderr.decode()
        except asyncio.TimeoutError:
            proc.terminate()
            return f"错误: 命令执行超时（{timeout}秒）"
