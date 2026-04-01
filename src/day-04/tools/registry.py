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
