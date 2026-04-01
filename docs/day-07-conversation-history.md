# Day 7: 对话历史管理 — 多轮对话的基石

## 目标

今天我们将学习如何管理对话历史。这是 Claude Code 能进行多轮对话的核心——AI 需要"记住"之前说过的话。同时，我们也要处理 Token 限制：当对话太长时，需要智能地截断或总结历史。

学完今天后，你将能：
- 设计 Message 数据结构（role + content）
- 实现消息追加和历史查询
- 处理 Token 限制（简单截断策略）
- 理解"上下文窗口"的概念

## 预习

- [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) — messages 字段格式
- [上下文窗口 (Context Window)](https://docs.anthropic.com/en/docs/about-context-window) — Token 上限概念
- [Token 计数原理](https://docs.anthropic.com/en/docs/token-counting) — 为什么需要限制历史

## 骨架代码

```python
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
        # TODO: 使用 tiktoken.get_encoding("cl100k_base") 初始化分词器
        # 这是 GPT-4/Claude 使用的分词器
        pass

    def add_message(self, role: MessageRole, content: str) -> None:
        """追加一条消息"""
        # TODO: 将 Message(role, content) 添加到 self.messages 列表
        raise NotImplementedError("add_message 需要你实现")

    def get_messages(self) -> list[dict]:
        """返回所有消息（转为 API 需要的 dict 格式）"""
        # TODO: 返回 [{"role": m.role, "content": m.content} for m in self.messages]
        raise NotImplementedError("get_messages 需要你实现")

    def count_tokens(self) -> int:
        """计算当前历史的总 Token 数"""
        # TODO: 使用 self._tokenizer.encode() 对每条消息内容编码
        # 返回所有消息的 token 总数
        raise NotImplementedError("count_tokens 需要你实现")

    def truncate(self, max_tokens: int) -> None:
        """截断历史，保留最近 max_tokens 个 token"""
        # TODO: 从最后往前数，保留 token 数不超过 max_tokens 的消息
        # 提示: 先尝试保留全部，然后逐步移除最老的消息直到满足限制
        raise NotImplementedError("truncate 需要你实现")

    def clear(self) -> None:
        """清空历史"""
        self.messages.clear()
```

```python
"""main.py — Day 7: 对话历史演示"""

from history import ConversationHistory, Message


async def main():
    history = ConversationHistory()
    max_tokens = 100  # Claude 3.5 Sonnet 上下文约 200K tokens，这里用小数字演示

    print(f"最大 Token 数: {max_tokens}")
    print("=" * 50)

    # 添加系统消息
    history.add_message("system", "你是一个友好的 Python 编程助手。")
    print(f"[系统消息] Token 数: {history.count_tokens()}")

    # 添加对话
    exchanges = [
        ("user", "你好，请介绍一下 Python。"),
        ("assistant", "Python 是一种高级编程语言，由 Guido van Rossum 创建。"),
        ("user", "它最适合做什么？"),
        ("assistant", "Python 最适合：数据分析、Web 开发、AI/ML、自动化脚本。"),
        ("user", "能给我一个 Web 框架的例子吗？"),
        ("assistant", "Flask 是一个轻量级 Web 框架，适合小中型应用。"),
    ]

    for role, content in exchanges:
        history.add_message(role, content)
        total = history.count_tokens()
        print(f"[{role}] {total} tokens")
        if total > max_tokens:
            print(f"  ⚠️ 超过限制，开始截断...")
            history.truncate(max_tokens)
            print(f"  截断后: {history.count_tokens()} tokens，保留 {len(history.messages)} 条消息")

    print()
    print(f"最终历史：{len(history.messages)} 条消息，{history.count_tokens()} tokens")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

## 作业（填空题）

### 题目 1：实现 add_message 和 get_messages

```python
def add_message(self, role: MessageRole, content: str) -> None:
    self.messages.append(Message(role=role, content=content))

def get_messages(self) -> list[dict]:
    return [{"role": m.role, "content": m.content} for m in self.messages]
```

### 题目 2：实现 count_tokens

```python
def count_tokens(self) -> int:
    if self._tokenizer is None:
        self._tokenizer = tiktoken.get_encoding("cl100k_base")
    total = 0
    for msg in self.messages:
        tokens = self._tokenizer.encode(msg.content)
        total += len(tokens)
    return total
```

### 题目 3：实现 truncate

```python
def truncate(self, max_tokens: int) -> None:
    while self.count_tokens() > max_tokens and len(self.messages) > 1:
        self.messages.pop(0)  # 移除最老的消息
```

## 答案解析

<details>
<summary>点击展开 Day 7 完整答案</summary>

### history.py 完整实现

```python
"""history.py — 对话历史管理"""

from dataclasses import dataclass, field
from typing import Literal, Optional
import tiktoken

MessageRole = Literal["user", "assistant", "system"]


@dataclass
class Message:
    role: MessageRole
    content: str


@dataclass
class ConversationHistory:
    messages: list[Message] = field(default_factory=list)
    _tokenizer: Optional[tiktoken.Encoding] = field(default=None, repr=False)

    def __post_init__(self):
        self._tokenizer = tiktoken.get_encoding("cl100k_base")

    def add_message(self, role: MessageRole, content: str) -> None:
        self.messages.append(Message(role=role, content=content))

    def get_messages(self) -> list[dict]:
        return [{"role": m.role, "content": m.content} for m in self.messages]

    def count_tokens(self) -> int:
        total = 0
        for msg in self.messages:
            tokens = self._tokenizer.encode(msg.content)
            total += len(tokens)
        return total

    def truncate(self, max_tokens: int) -> None:
        while self.count_tokens() > max_tokens and len(self.messages) > 1:
            self.messages.pop(0)

    def clear(self) -> None:
        self.messages.clear()
```

### 关键概念

1. **上下文窗口**: Claude 模型有最大 Token 限制（上下文窗口），超过限制必须截断或总结
2. **@dataclass**: Python 数据类，比字典更类型安全且代码更简洁
3. **tiktoken**: OpenAI 开源的分词器，与 Claude 高度兼容

</details>

## 延伸阅读

- [tiktoken GitHub](https://github.com/openai/tiktoken)
- [Anthropic 上下文窗口文档](https://docs.anthropic.com/en/docs/about-context-window)
