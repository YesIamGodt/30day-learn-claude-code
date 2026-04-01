# Day 5: 第一个工具 — BashTool + 文件读写

## 目标

今天我们将基于 Day 4 的 Tool 系统，实现三个最基础的工具：BashTool（执行命令）、FileReadTool（读文件）、FileWriteTool（写文件）。这三个工具是 Claude Code 最核心的能力——没有它们，AI 只能说话，不能操作文件。

学完今天后，你将能：
- 实现 `BaseTool` 的子类，重写 `name`、`description`、`execute`
- 用 `subprocess` 执行系统命令并捕获输出
- 用 `pathlib` 安全读写文件
- 实现超时控制和错误处理

## 预习

- [subprocess 官方文档](https://docs.python.org/3/library/subprocess.html) — 执行外部命令
- [pathlib 官方文档](https://docs.python.org/3/library/pathlib.html) — 文件路径操作
- [Python 异步 subprocess](https://docs.python.org/3/library/asyncio.subprocess.html) — 异步执行命令

## 骨架代码

```python
"""tools/bash.py — BashTool: 执行 shell 命令"""

import asyncio
import subprocess
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
        # TODO: 使用 asyncio.create_subprocess_shell 创建异步进程
        # 提示: proc = await asyncio.create_subprocess_shell(
        #           command,
        #           stdout=asyncio.subprocess.PIPE,
        #           stderr=asyncio.subprocess.PIPE,
        #       )
        # 等待完成: stdout, stderr = await proc.communicate()
        # 返回: stdout.decode() + stderr.decode()
        # 如果超时，终止进程并抛出 asyncio.TimeoutError
        raise NotImplementedError("execute 需要你实现 asyncio.create_subprocess_shell")
```

```python
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
        """异步读取文件"""
        # TODO: 使用 asyncio.to_thread 运行阻塞的 Path.read_text
        # 提示: return await asyncio.to_thread(Path(path).read_text)
        # 捕获 FileNotFoundError，返回错误信息
        raise NotImplementedError("execute 需要你实现 asyncio.to_thread")
```

```python
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
        # TODO: 使用 asyncio.to_thread 运行阻塞的 Path.write_text
        # 返回: f"成功写入 {path}，共 {len(content)} 字符"
        raise NotImplementedError("execute 需要你实现 asyncio.to_thread + Path.write_text")
```

```python
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

    # 演示 BashTool
    bash = registry.get("bash")
    result = await bash.execute("echo 'Hello from BashTool!'")
    print(f"BashTool: {result}")

    # 演示 FileWriteTool
    write_tool = registry.get("file_write")
    await write_tool.execute(("demo.txt", "Hello, Claude Code!\n"))
    print("FileWriteTool: demo.txt 已写入")

    # 演示 FileReadTool
    read_tool = registry.get("file_read")
    content = await read_tool.execute("demo.txt")
    print(f"FileReadTool: {content.strip()}")


if __name__ == "__main__":
    asyncio.run(main())
```

## 作业（填空题）

### 题目 1：实现 BashTool.execute()

补充 `tools/bash.py` 中的 `execute()` 方法：

```python
async def execute(self, command: str, timeout: int = 30) -> str:
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
```

### 题目 2：实现 FileReadTool.execute()

补充 `tools/file_read.py` 中的 `execute()` 方法：

```python
async def execute(self, path: str) -> str:
    try:
        return await asyncio.to_thread(Path(path).read_text)
    except FileNotFoundError:
        return f"错误: 文件不存在: {path}"
    except PermissionError:
        return f"错误: 无权读取: {path}"
```

### 题目 3：实现安全路径检查

在 FileReadTool 和 FileWriteTool 中添加路径安全检查，防止访问工作目录之外的文件：

```python
import os

async def execute(self, path: str) -> str:
    # 安全检查：禁止路径遍历攻击
    resolved = Path(path).resolve()
    cwd = Path.cwd().resolve()
    if not str(resolved).startswith(str(cwd)):
        return f"错误: 禁止访问工作目录之外的文件: {path}"
    ...
```

## 答案解析

<details>
<summary>点击展开 Day 5 完整答案</summary>

### tools/bash.py

```python
"""tools/bash.py — BashTool"""

import asyncio
import subprocess
from tools.base import BaseTool


class BashTool(BaseTool[str, str]):
    @property
    def name(self) -> str:
        return "bash"

    @property
    def description(self) -> str:
        return "执行 shell 命令，返回 stdout 和 stderr 的组合输出"

    async def execute(self, command: str, timeout: int = 30) -> str:
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
```

### 关键点

1. **asyncio.create_subprocess_shell**: 异步创建子进程，不阻塞事件循环
2. **asyncio.wait_for**: 为协程添加超时控制
3. **asyncio.to_thread**: 将阻塞 I/O 操作（文件读写）放入线程池，避免阻塞事件循环
4. **路径安全**: 始终检查文件路径是否在工作目录内，防止 `../../etc/passwd` 攻击

</details>

## 延伸阅读

- [asyncio subprocess 官方文档](https://docs.python.org/3/library/asyncio-subprocess.html)
- [pathlib vs os.path](https://docs.python.org/3/library/pathlib.html)
- [subprocess 安全性警告](https://docs.python.org/3/library/subprocess.html#security-considerations)
