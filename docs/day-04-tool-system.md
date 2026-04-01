# Day 4: Tool 系统设计 — 抽象基类与注册表模式

## 目标

今天我们将学习 Claude Code 最核心的设计：Tool 系统。所有 AI 能调用的工具（Bash、文件读写、搜索等）都通过统一的接口注册和管理。这是一种**插件式架构**，让你可以随时添加新工具而不改动核心代码。

学完今天后，你将能：
- 理解什么是抽象基类（ABC），为什么需要它
- 掌握注册表模式（Registry Pattern）
- 设计一个统一的工具接口规范
- 理解为什么 Claude Code 能支持 40+ 工具

## 预习

- [Python 抽象基类（abc 模块）](https://docs.python.org/3/library/abc.html) — 抽象方法的定义
- [注册表模式 Explained](https://refactoring.guru/design-patterns/registry) — 工具注册机制
- [Python dataclasses vs 字典](https://realpython.com/python-data-classes/) — 工具输入/输出的数据结构

## 骨架代码

```python
"""tools/base.py — 工具基类定义"""

from abc import ABC, abstractmethod
from typing import Any, TypeVar, Generic

TInput = TypeVar("TInput")
TOutput = TypeVar("TOutput")


class BaseTool(ABC, Generic[TInput, TOutput]):
    """所有工具的抽象基类"""

    @property
    @abstractmethod
    def name(self) -> str:
        """工具的唯一名称，如 'bash'、'file_read'"""
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        """工具的描述，供 AI 理解工具的用途"""
        ...

    @abstractmethod
    async def execute(self, input_data: TInput) -> TOutput:
        """执行工具的核心逻辑（异步）"""
        ...

    def to_schema(self) -> dict[str, Any]:
        """返回工具的 JSON Schema，供 AI 理解输入格式"""
        return {
            "name": self.name,
            "description": self.description,
        }
```

```python
"""tools/registry.py — 工具注册表"""

from typing import Any
from tools.base import BaseTool


class ToolRegistry:
    """全局工具注册表"""

    def __init__(self):
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        """注册一个工具"""
        # TODO: 将工具按 name 存入 self._tools
        # 如果已存在同名工具，抛出 ValueError(f"工具 {tool.name} 已注册")
        raise NotImplementedError("register 需要你实现")

    def get(self, name: str) -> BaseTool:
        """根据名称获取工具"""
        # TODO: 从 self._tools 中查找并返回工具
        # 如果不存在，抛出 KeyError(f"工具 {name} 未注册")
        raise NotImplementedError("get 需要你实现")

    def list_tools(self) -> list[BaseTool]:
        """列出所有已注册的工具"""
        # TODO: 返回所有工具的列表
        raise NotImplementedError("list_tools 需要你实现")

    def clear(self) -> None:
        """清空所有工具（测试用）"""
        self._tools.clear()


# 全局单例
_registry = ToolRegistry()


def get_registry() -> ToolRegistry:
    return _registry
```

```python
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
    registry.clear()  # 清空测试

    hello = HelloTool()
    registry.register(hello)

    print("已注册工具:", [t.name for t in registry.list_tools()])

    tool = registry.get("hello")
    result = await tool.execute("Claude")
    print(f"执行结果: {result}")


if __name__ == "__main__":
    asyncio.run(main())
```

## 作业（填空题）

### 题目 1：实现 ToolRegistry.register()

在 `tools/registry.py` 的 `register()` 方法中实现注册逻辑：

```python
def register(self, tool: BaseTool) -> None:
    if tool.name in self._tools:
        raise ValueError(f"工具 {tool.name} 已注册")
    self._tools[tool.name] = tool
```

实现后运行 `python src/day-04/main.py`，观察输出。

### 题目 2：实现 ToolRegistry.get()

在 `get()` 方法中实现查找逻辑：

```python
def get(self, name: str) -> BaseTool:
    if name not in self._tools:
        raise KeyError(f"工具 {name} 未注册")
    return self._tools[name]
```

测试：
```python
registry.get("nonexistent")  # 应抛出 KeyError
```

### 题目 3：添加一个新工具

仿照 `HelloTool`，创建一个 `EchoTool`，它返回输入的反转字符串：

```python
class EchoTool(BaseTool[str, str]):
    @property
    def name(self) -> str:
        return "echo"

    @property
    def description(self) -> str:
        return "返回输入的反转字符串"

    async def execute(self, input_data: str) -> str:
        return input_data[::-1]
```

在 `main()` 中注册并调用 `EchoTool()`，验证它是否正确反转字符串。

## 答案解析

<details>
<summary>点击展开 Day 4 完整答案</summary>

### tools/registry.py 完整实现

```python
"""tools/registry.py — 工具注册表"""

from typing import Any
from tools.base import BaseTool


class ToolRegistry:
    """全局工具注册表"""

    def __init__(self):
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        if tool.name in self._tools:
            raise ValueError(f"工具 {tool.name} 已注册")
        self._tools[tool.name] = tool

    def get(self, name: str) -> BaseTool:
        if name not in self._tools:
            raise KeyError(f"工具 {name} 未注册")
        return self._tools[name]

    def list_tools(self) -> list[BaseTool]:
        return list(self._tools.values())

    def clear(self) -> None:
        self._tools.clear()


_registry = ToolRegistry()


def get_registry() -> ToolRegistry:
    return _registry
```

### 关键设计模式

1. **抽象基类（ABC）**: `BaseTool` 定义了所有工具必须实现的接口（name、description、execute），确保工具行为一致
2. **注册表模式**: `ToolRegistry` 统一管理所有工具实例，支持按名查找、列表查看
3. **泛型（Generic）**: `BaseTool[TInput, TOutput]` 让每个工具可以声明自己的输入/输出类型，同时保持统一接口

</details>

## 延伸阅读

- [Python ABC 官方文档](https://docs.python.org/3/library/abc.html)
- [注册表模式 — Refactoring Guru](https://refactoring.guru/design-patterns/registry)
- [Claude Code Tool System 解析](https://modelcontextprotocol.io/) — MCP 协议参考
