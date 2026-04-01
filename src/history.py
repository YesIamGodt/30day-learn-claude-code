"""history.py — 对话历史管理（顶层模块）"""

from dataclasses import dataclass, field
from typing import Literal, Optional

MessageRole = Literal["user", "assistant", "system"]


@dataclass
class Message:
    """单条对话消息"""
    role: MessageRole
    content: str


@dataclass
class ConversationHistory:
    """对话历史管理器"""
    messages: list[Message] = field(default_factory=list)

    def add_message(self, role: MessageRole, content: str) -> None:
        """追加一条消息"""
        self.messages.append(Message(role=role, content=content))

    def get_messages(self) -> list[dict]:
        """返回所有消息（转为 API 需要的 dict 格式）"""
        return [{"role": m.role, "content": m.content} for m in self.messages]

    def clear(self) -> None:
        """清空历史"""
        self.messages.clear()
