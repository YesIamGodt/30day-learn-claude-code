"""token_counter.py — Token 计数器"""

import tiktoken
from dataclasses import dataclass

# Anthropic 定价（每百万 Token，美元）
PRICING = {
    "claude-opus-4-5": {"input": 15.0, "output": 75.0},
    "claude-sonnet-4-6": {"input": 3.0, "output": 15.0},
    "claude-haiku-4-5": {"input": 0.8, "output": 4.0},
}


class TokenCounter:
    def __init__(self):
        self._tokenizer = tiktoken.get_encoding("cl100k_base")
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_cost = 0.0

    def count(self, text: str) -> int:
        return len(self._tokenizer.encode(text))

    def estimate_cost(
        self,
        input_tokens: int,
        output_tokens: int,
        model: str = "claude-sonnet-4-6",
    ) -> float:
        prices = PRICING.get(model, PRICING["claude-sonnet-4-6"])
        return (input_tokens * prices["input"] + output_tokens * prices["output"]) / 1_000_000

    def record(self, input_tokens: int, output_tokens: int, model: str = "claude-sonnet-4-6"):
        cost = self.estimate_cost(input_tokens, output_tokens, model)
        self.total_input_tokens += input_tokens
        self.total_output_tokens += output_tokens
        self.total_cost += cost

    def summary(self) -> str:
        return (
            f"Token 使用: 输入 {self.total_input_tokens}，输出 {self.total_output_tokens}\n"
            f"总成本: ${self.total_cost:.4f}"
        )
