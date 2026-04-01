# Day 8: 工具调用循环 — ReAct 模式的核心

## 目标

今天我们将实现 Claude Code 最核心的机制：**工具调用循环**（Tool Call Loop）。这是 AI 能够"思考并行动"的关键——AI 决定调用工具，工具返回结果，AI 继续思考，直到任务完成。

学完今天后，你将能：
- 理解 ReAct（Reason + Act）模式
- 实现工具调用的检测和执行循环
- 处理工具结果注入到 AI 上下文中
- 设置循环上限，防止无限循环

## 预习

- [ReAct 论文](https://arxiv.org/abs/2210.03629) — 推理+行动模式
- [Anthropic Tool Use 文档](https://docs.anthropic.com/en/docs/build/claude-code/agentic-tool-use) — Claude 如何调用工具
- [LLM Agent 架构](https://lilianweng.github.io/posts/2023-06-23-agent/) — Agent 系统设计

## 骨架代码

```python
"""engine.py — 工具调用循环引擎"""

from dataclasses import dataclass, field
from typing import Literal, Optional
from anthropic import Anthropic
from anthropic.types import Message as AnthropicMessage
from history import ConversationHistory
from tools.registry import get_registry


@dataclass
class ToolCall:
    """一次工具调用"""
    id: str
    name: str
    input_data: dict


@dataclass
class ToolResult:
    """工具执行结果"""
    tool_call_id: str
    output: str
    is_error: bool = False


@dataclass
class QueryEngine:
    """查询引擎：管理 AI 调用循环"""
    client: Anthropic
    history: ConversationHistory
    max_turns: int = 30
    max_tokens: int = 4096

    async def run(self, prompt: str) -> str:
        """运行一次完整的查询（含工具调用循环）"""
        # TODO: 实现工具调用循环
        raise NotImplementedError("run 需要你实现")

    async def step(self, prompt: str) -> tuple[AnthropicMessage, list[ToolCall]]:
        """执行一步：发送请求，返回 AI 响应和工具调用列表"""
        # TODO: 调用 client.messages.create，传入 self.history.get_messages()
        # 返回 (response, tool_calls)
        # 提示: 使用 client.messages.create() 的 tools 参数传入工具 schema
        raise NotImplementedError("step 需要你实现")

    async def execute_tool(self, tool_call: ToolCall) -> ToolResult:
        """执行单个工具调用"""
        # TODO: 从 registry 获取工具，调用其 execute 方法
        # 捕获异常，返回 ToolResult(is_error=True)
        raise NotImplementedError("execute_tool 需要你实现")
```

```python
"""main.py — Day 8: 工具调用循环演示"""

import asyncio
import os
from anthropic import Anthropic
from engine import QueryEngine, ToolCall
from history import ConversationHistory
from tools.registry import get_registry
from tools.bash import BashTool


async def main():
    # 初始化
    api_key = os.environ.get("ANTHROPIC_API_KEY", "sk-test")
    client = Anthropic(api_key=api_key)
    history = ConversationHistory()
    registry = get_registry()
    registry.clear()
    registry.register(BashTool())

    engine = QueryEngine(client=client, history=history)

    print("Claude Code — 工具调用演示")
    print("=" * 50)

    # 发送第一条消息（AI 决定是否调用工具）
    prompt = "请执行 `echo 'Hello, Claude!'` 命令"
    print(f"用户: {prompt}")

    result = await engine.run(prompt)
    print(f"\nClaude: {result}")


if __name__ == "__main__":
    asyncio.run(main())
```

## 作业（填空题）

### 题目 1：实现 execute_tool

```python
async def execute_tool(self, tool_call: ToolCall) -> ToolResult:
    registry = get_registry()
    tool = registry.get(tool_call.name)
    try:
        result = await tool.execute(tool_call.input_data)
        return ToolResult(tool_call_id=tool_call.id, output=str(result))
    except Exception as e:
        return ToolResult(tool_call_id=tool_call.id, output=f"错误: {e}", is_error=True)
```

### 题目 2：实现 step（AI 请求）

```python
async def step(self, prompt: str) -> tuple[AnthropicMessage, list[ToolCall]]:
    self.history.add_message("user", prompt)
    tools = [t.to_schema() for t in get_registry().list_tools()]

    response = self.client.messages.create(
        model="claude-opus-4-5",
        max_tokens=self.max_tokens,
        messages=self.history.get_messages(),
        tools=tools if tools else None,
    )

    self.history.add_message("assistant", response.content[0].text if response.content else "")
    return response, response.tool_calls or []
```

### 题目 3：实现 run（工具调用循环）

```python
async def run(self, prompt: str) -> str:
    for turn in range(self.max_turns):
        response, tool_calls = await self.step(prompt)
        prompt = ""  # 后续循环不需要新 prompt

        if not tool_calls:
            return response.content[0].text if response.content else ""

        # 执行所有工具调用
        results = []
        for tc in tool_calls:
            result = await self.execute_tool(tc)
            results.append(result)
            self.history.add_message(
                "user",
                f"[TOOL_CALL id=\"{tc.id}\"] {tc.name} result: {result.output}"
            )

    return "错误: 达到最大循环次数（无限循环检测）"
```

## 答案解析

<details>
<summary>点击展开 Day 8 完整答案</summary>

### engine.py 完整实现

```python
"""engine.py — 工具调用循环引擎"""

from typing import Optional
from anthropic import Anthropic
from anthropic.types import Message as AnthropicMessage
from history import ConversationHistory, Message
from tools.registry import get_registry


class ToolCall:
    def __init__(self, id: str, name: str, input_data):
        self.id = id
        self.name = name
        self.input = input_data


class ToolResult:
    def __init__(self, tool_call_id: str, output: str, is_error: bool = False):
        self.tool_call_id = tool_call_id
        self.output = output
        self.is_error = is_error


class QueryEngine:
    def __init__(self, client: Anthropic, history: ConversationHistory, max_turns: int = 30, max_tokens: int = 4096):
        self.client = client
        self.history = history
        self.max_turns = max_turns
        self.max_tokens = max_tokens

    async def run(self, prompt: str) -> str:
        for turn in range(self.max_turns):
            response, tool_calls = await self.step(prompt)
            prompt = ""

            if not tool_calls:
                return response.content[0].text if response.content else ""

            for tc in tool_calls:
                result = await self.execute_tool(tc)
                self.history.add_message(
                    "user",
                    f"[TOOL_CALL id=\"{tc.id}\"] {tc.name} result: {result.output}"
                )

        return "错误: 达到最大循环次数（无限循环检测）"

    async def step(self, prompt: str) -> tuple:
        if prompt:
            self.history.add_message("user", prompt)

        tools = [t.to_schema() for t in get_registry().list_tools()]

        response = self.client.messages.create(
            model="claude-opus-4-5",
            max_tokens=self.max_tokens,
            messages=self.history.get_messages(),
            tools=tools if tools else None,
        )

        text = response.content[0].text if (response.content and hasattr(response.content[0], 'text')) else ""
        if text:
            self.history.add_message("assistant", text)

        return response, response.tool_calls or []

    async def execute_tool(self, tool_call: ToolCall) -> ToolResult:
        registry = get_registry()
        tool = registry.get(tool_call.name)
        try:
            result = await tool.execute(tool_call.input)
            return ToolResult(tool_call_id=tool_call.id, output=str(result))
        except Exception as e:
            return ToolResult(tool_call_id=tool_call.id, output=f"错误: {e}", is_error=True)
```

### 关键点

1. **ReAct 循环**: while tool_calls: execute → inject_result → respond
2. **无限循环防护**: max_turns 限制循环次数
3. **结果注入**: 工具结果以 user 消息形式注入历史，保持对话连贯

</details>

## 延伸阅读

- [ReAct 论文精读](https://arxiv.org/abs/2210.03629)
- [Claude Tool Use API](https://docs.anthropic.com/en/docs/build/claude-code/agentic-tool-use)
- [LLM Agent 架构图解](https://lilianweng.github.io/posts/2023-06-23-agent/)
