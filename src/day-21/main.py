"""main.py"""
import asyncio
from skill import Skill, Step, SkillRunner

async def main():
    runner = SkillRunner()

    runner.register(Skill(
        name="hello-world",
        description="输出 Hello World",
        steps=[
            Step(name="step1", action="print", params={"message": "Hello, World!"}),
        ]
    ))

    results = await runner.run("hello-world")
    for r in results:
        print(r)

if __name__ == "__main__":
    asyncio.run(main())
