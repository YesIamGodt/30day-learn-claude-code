# Day 19: 上下文压缩 — Context Compaction

## 目标

当对话历史变得很长时，我们需要压缩上下文以节省 Token。Claude Code 使用摘要策略：用 AI 将历史压缩成摘要。

## 骨架代码

```python
"""compactor.py"""
from history import ConversationHistory, Message

class ContextCompactor:
    def __init__(self, max_messages: int = 50, max_tokens: int = 8000):
        self.max_messages = max_messages
        self.max_tokens = max_tokens

    def should_compact(self, history: ConversationHistory) -> bool:
        # TODO: 当消息数超过 max_messages 时返回 True
        raise NotImplementedError

    def compact(self, history: ConversationHistory, summary: str) -> None:
        # TODO: 保留前 2 条（通常是系统消息），中间替换为摘要消息
        raise NotImplementedError
```

## 作业

### 题目 1：实现 should_compact
消息数超过阈值时返回 True。

### 题目 2：实现 compact
保留前两条消息，中间压缩为摘要。

## 答案解析

<details>
<summary>点击展开 Day 19 答案</summary>

```python
"""compactor.py"""
from history import ConversationHistory, Message

class ContextCompactor:
    def __init__(self, max_messages: int = 50, max_tokens: int = 8000):
        self.max_messages = max_messages
        self.max_tokens = max_tokens

    def should_compact(self, history: ConversationHistory) -> bool:
        return len(history.messages) > self.max_messages

    def compact(self, history: ConversationHistory, summary: str) -> None:
        # 保留前 2 条消息（通常是 system + 最早的用户消息）
        keep = history.messages[:2]
        # 中间部分替换为摘要
        keep.append(Message(role="system", content=f"[历史摘要] {summary}"))
        # 保留最近的消息
        keep.extend(history.messages[-self.max_messages // 2:])
        history.messages.clear()
        history.messages.extend(keep)
```

</details>

## 延伸阅读
- [Anthropic 上下文管理](https://docs.anthropic.com/en/docs/build/claude-code/compact)
