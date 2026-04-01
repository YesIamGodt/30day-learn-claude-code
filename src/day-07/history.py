"""history.py — 对话历史管理"""

from dataclasses import dataclass, field
from typing import Literal, Optional
import tiktoken

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
    _tokenizer: Optional[tiktoken.Encoding] = field(default=None, repr=False)

    def __post_init__(self):
        self._tokenizer = tiktoken.get_encoding("cl100k_base")

    def add_message(self, role: MessageRole, content: str) -> None:
        """追加一条消息"""
        self.messages.append(Message(role=role, content=content))

    def get_messages(self) -> list[dict]:
        """返回所有消息（转为 API 需要的 dict 格式）"""
        return [{"role": m.role, "content": m.content} for m in self.messages]

    def count_tokens(self) -> int:
        """计算当前历史的总 Token 数"""
        total = 0
        for msg in self.messages:
            tokens = self._tokenizer.encode(msg.content)
            total += len(tokens)
        return total

    def truncate(self, max_tokens: int) -> None:
        """截断历史，保留最近 max_tokens 个 token"""
        while self.count_tokens() > max_tokens and len(self.messages) > 1:
            self.messages.pop(0)

    def clear(self) -> None:
        """清空历史"""
        self.messages.clear()
