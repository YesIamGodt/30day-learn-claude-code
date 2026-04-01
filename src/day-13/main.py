"""main.py"""
import asyncio
from retry import retry

@retry(max_attempts=3, base_delay=0.5)
async def unreliable_task():
    import random
    if random.random() < 0.7:
        raise ValueError("随机失败")
    return "成功!"

async def main():
    try:
        result = await unreliable_task()
        print(f"结果: {result}")
    except ValueError as e:
        print(f"最终失败: {e}")

if __name__ == "__main__":
    asyncio.run(main())
