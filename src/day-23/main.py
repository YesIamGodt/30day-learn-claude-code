"""main.py"""
import asyncio
from agent import Agent, AgentTeam

async def main():
    team = AgentTeam()
    team.add(Agent("助手A", "代码审查员"))
    team.add(Agent("助手B", "文档撰写员"))

    results = await team.run_parallel("分析 Python 异步编程的优缺点")
    for name, result in results.items():
        print(f"\n{name}:\n{result}")

if __name__ == "__main__":
    asyncio.run(main())
