"""skill.py"""
from dataclasses import dataclass, field
from typing import Any

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
