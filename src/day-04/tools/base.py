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
        """工具的唯一名称"""
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
        """返回工具的 JSON Schema"""
        return {
            "name": self.name,
            "description": self.description,
        }
