# Day 16: 命令系统 — /help、/config、/model

## 目标

今天我们将实现命令系统。Claude Code 支持 `/` 开头的特殊命令（如 `/help`、`/config`、`/clear`），用于控制程序行为而非发送给 AI。

## 骨架代码

```python
"""commands/registry.py"""
from typing import Callable, Awaitable
from dataclasses import dataclass

@dataclass
class Command:
    name: str
    description: str
    handler: Callable[[], Awaitable[str]]

class CommandRegistry:
    def __init__(self):
        self._commands: dict[str, Command] = {}

    def register(self, name: str, description: str, handler: Callable[[], Awaitable[str]]):
        self._commands[name] = Command(name=name, description=description, handler=handler)

    def get(self, name: str) -> Command | None:
        return self._commands.get(name)

    def list_commands(self) -> list[Command]:
        return list(self._commands.values())

    def is_command(self, text: str) -> bool:
        return text.startswith("/") and text[1:].split()[0] in self._commands
```

### docs

## 作业

### 题目 1：实现 /help 命令
显示所有可用命令列表。

### 题目 2：实现 /model 命令
切换使用的模型。

### 题目 3：实现 /config 命令
显示当前配置。

## 答案解析

<details>
<summary>点击展开 Day 16 答案</summary>

```python
"""commands.py"""
from dataclasses import dataclass
from typing import Callable, Awaitable, Any

@dataclass
class Command:
    name: str
    description: str
    handler: Callable[..., Awaitable[str]]

class CommandRegistry:
    def __init__(self):
        self._commands: dict[str, Command] = {}

    def register(self, name: str, description: str, handler: Callable[..., Awaitable[str]]):
        self._commands[name] = Command(name=name, description=description, handler=handler)

    def get(self, name: str) -> Command | None:
        return self._commands.get(name)

    def is_command(self, text: str) -> bool:
        if not text.startswith("/"):
            return False
        cmd_name = text[1:].split()[0]
        return cmd_name in self._commands

    def list_all(self) -> list[Command]:
        return list(self._commands.values())
```

</details>

## 延伸阅读
- [argparse vs click vs typer](https://www.google.com/search?q=python+cli+framework+comparison)
