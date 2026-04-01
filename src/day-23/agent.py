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
