# Day 23: 子 Agent — 多 Agent 协作

## 目标

Claude Code 可以派生子 Agent 并行处理任务。每个子 Agent 是独立的 AI 实例，有自己的对话历史和工具集。

## 骨架代码

```python
"""agent.py"""
import asyncio
from typing import Optional
from anthropic import Anthropic

class Agent:
    def __init__(self, name: str, role: str, api_key: Optional[str] = None):
        self.name = name
        self.role = role
        self.client = Anthropic(api_key=api_key or "")

    async def run(self, task: str) -> str:
        # TODO: 使用 system prompt 设置角色，调用 API
        raise NotImplementedError

class AgentTeam:
    def __init__(self):
        self.agents: dict[str, Agent] = {}

    def add(self, agent: Agent):
        self.agents[agent.name] = agent

    async def run_parallel(self, task: str) -> dict[str, str]:
        # TODO: asyncio.gather 并行执行所有 agent
        raise NotImplementedError
```

## 答案解析

<details>
<summary>点击展开 Day 23 答案</summary>

```python
"""agent.py"""
import asyncio
from typing import Optional
from anthropic import Anthropic
from anthropic.types import Message

class Agent:
    def __init__(self, name: str, role: str, api_key: Optional[str] = None):
        self.name = name
        self.role = role
        self.client = Anthropic(api_key=api_key or "")

    async def run(self, task: str) -> str:
        response = self.client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            messages=[
                {"role": "system", "content": f"你是 {self.name}，角色: {self.role}"},
                {"role": "user", "content": task},
            ],
        )
        return response.content[0].text

class AgentTeam:
    def __init__(self):
        self.agents: dict[str, Agent] = {}

    def add(self, agent: Agent):
        self.agents[agent.name] = agent

    async def run_parallel(self, task: str) -> dict[str, str]:
        coroutines = [agent.run(task) for agent in self.agents.values()]
        results = await asyncio.gather(*coroutines)
        return dict(zip(self.agents.keys(), results))
```

</details>

## 延伸阅读
- [Multi-Agent Systems](https://arxiv.org/abs/2308.00352)
