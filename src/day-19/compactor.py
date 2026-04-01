"""compactor.py"""
from history import ConversationHistory, Message

class ContextCompactor:
    def __init__(self, max_messages: int = 50, max_tokens: int = 8000):
        self.max_messages = max_messages
        self.max_tokens = max_tokens

    def should_compact(self, history: ConversationHistory) -> bool:
        return len(history.messages) > self.max_messages

    def compact(self, history: ConversationHistory, summary: str) -> None:
        keep = history.messages[:2]
        keep.append(Message(role="system", content=f"[历史摘要] {summary}"))
        keep.extend(history.messages[-self.max_messages // 2:])
        history.messages.clear()
        history.messages.extend(keep)
