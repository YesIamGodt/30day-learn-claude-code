# Day 21: Skill 系统 — 自定义工作流执行

## 目标

Skill 是一个可复用的工作流定义。Claude Code 的 Skill 系统让你可以定义复杂的多步骤工作流，一键执行。

## 骨架代码

```python
"""skill.py"""
from dataclasses import dataclass, field
from typing import Callable, Awaitable

@dataclass
class Step:
    name: str
    action: str
    params: dict = field(default_factory=dict)

@dataclass
class Skill:
    name: str
    description: str
    steps: list[Step]

class SkillRunner:
    def __init__(self):
        self._skills: dict[str, Skill] = {}

    def register(self, skill: Skill):
        self._skills[skill.name] = skill

    def get(self, name: str) -> Skill | None:
        return self._skills.get(name)

    async def run(self, skill_name: str) -> list[str]:
        skill = self._skills.get(skill_name)
        if not skill:
            return [f"错误: Skill '{skill_name}' 不存在"]
        results = []
        for step in skill.steps:
            results.append(f"[{step.name}] 执行: {step.action}")
        return results
```

## 作业

### 题目 1：实现异步执行
用 asyncio 执行各步骤。

### 题目 2：添加步骤参数支持
根据 params 动态生成执行内容。

## 答案解析

<details>
<summary>点击展开 Day 21 答案</summary>

```python
"""skill.py"""
from dataclasses import dataclass, field

@dataclass
class Step:
    name: str
    action: str
    params: dict = field(default_factory=dict)

@dataclass
class Skill:
    name: str
    description: str
    steps: list[Step]

class SkillRunner:
    def __init__(self):
        self._skills: dict[str, Skill] = {}

    def register(self, skill: Skill):
        self._skills[skill.name] = skill

    def get(self, name: str) -> Skill | None:
        return self._skills.get(name)

    async def run(self, skill_name: str) -> list[str]:
        skill = self._skills.get(skill_name)
        if not skill:
            return [f"错误: Skill '{skill_name}' 不存在"]
        results = []
        for step in skill.steps:
            results.append(f"[{step.name}] 执行: {step.action}")
        return results
```

</details>

## 延伸阅读
- [Skill System Architecture](https://modelcontextprotocol.io/)
