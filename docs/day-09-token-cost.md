# Day 9: Token 计数与成本跟踪

## 目标

今天我们将实现 Token 计数和成本跟踪功能。这是控制 AI 使用成本的关键——每次 API 调用都有价格，了解 Token 用量可以帮你估算费用并优化提示词。

学完今天后，你将能：
- 使用 tiktoken 计算 Token 数量
- 根据 Anthropic 定价计算每次调用的成本
- 实现成本累计和显示

## 预习

- [Anthropic 定价页面](https://www.anthropic.com/pricing) — 各模型价格
- [tiktoken 分词器](https://github.com/openai/tiktoken) — Token 估算

## 骨架代码

```python
"""token_counter.py — Token 计数器"""

import tiktoken
from dataclasses import dataclass


# Anthropic 定价（每百万 Token，美元）
PRICING = {
    "claude-opus-4-5": {"input": 15.0, "output": 75.0},
    "claude-sonnet-4-6": {"input": 3.0, "output": 15.0},
    "claude-haiku-4-5": {"input": 0.8, "output": 4.0},
}


@dataclass
class CostRecord:
    input_tokens: int
    output_tokens: int
    cost: float


class TokenCounter:
    def __init__(self):
        self._tokenizer = tiktoken.get_encoding("cl100k_base")
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_cost = 0.0

    def count(self, text: str) -> int:
        # TODO: 使用 self._tokenizer.encode(text) 返回 token 数量
        raise NotImplementedError("count 需要你实现")

    def estimate_cost(
        self,
        input_tokens: int,
        output_tokens: int,
        model: str = "claude-sonnet-4-6",
    ) -> float:
        # TODO: 根据 PRICING 字典计算成本
        # 公式: (input_tokens * price_input + output_tokens * price_output) / 1_000_000
        raise NotImplementedError("estimate_cost 需要你实现")

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
```

```python
"""main.py"""
from token_counter import TokenCounter

def main():
    counter = TokenCounter()
    text = "Hello, Claude! This is a test message for token counting."
    tokens = counter.count(text)
    print(f"文本: {text}")
    print(f"Token 数: {tokens}")

    cost = counter.estimate_cost(input_tokens=1000, output_tokens=500, model="claude-sonnet-4-6")
    print(f"估算成本: ${cost:.4f}")

    counter.record(1000, 500)
    counter.record(2000, 1000)
    print(counter.summary())

if __name__ == "__main__":
    main()
```

## 作业（填空题）

### 题目 1：实现 count 方法

tiktoken 的 `encode()` 方法将文本转为 token ID 列表，`len()` 即为 token 数量：

```python
def count(self, text: str) -> int:
    return len(self._tokenizer.encode(text))
```

补充后运行 `python src/day-09/main.py` 验证。

### 题目 2：实现 estimate_cost 方法

根据 PRICING 字典查表计算：

```python
def estimate_cost(self, input_tokens: int, output_tokens: int, model: str = "claude-sonnet-4-6") -> float:
    prices = PRICING.get(model, PRICING["claude-sonnet-4-6"])
    return (input_tokens * prices["input"] + output_tokens * prices["output"]) / 1_000_000
```

### 题目 3：思考题

Claude 3.5 Sonnet 的定价为 $3/百万输入，$15/百万输出。如果你发送了 5000 个 token 的请求，AI 回复了 2000 个 token，总成本是多少？

## 答案解析

<details>
<summary>点击展开 Day 9 完整答案</summary>

### token_counter.py 完整实现

```python
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
```

### 关键知识点

1. **tiktoken 分词器**: `cl100k_base` 是 GPT-4/Claude 使用的分词方案，与 Claude API 高度兼容
2. **成本公式**: (input_tokens × input_price + output_tokens × output_price) / 1,000,000
3. **累计统计**: 多次调用 `record()` 累加成本，适合会话级别的成本追踪

### 题目 3 答案

Claude 3.5 Sonnet ($3/百万输入, $15/百万输出):
- 输入成本: 5000 × $3 / 1,000,000 = $0.015
- 输出成本: 2000 × $15 / 1,000,000 = $0.03
- 总成本: $0.045

</details>

## 延伸阅读

- [Anthropic 定价](https://www.anthropic.com/pricing)
- [tiktoken GitHub](https://github.com/openai/tiktoken)
