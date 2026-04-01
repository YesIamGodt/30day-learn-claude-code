"""day-02/main.py — Day 2: Python 异步编程基础"""

import asyncio
import time


async def fetch_data(name: str, delay: float) -> str:
    """模拟一个异步 I/O 操作（如 API 调用）"""
    print(f"[{name}] 开始请求...")
    await asyncio.sleep(delay)  # 模拟 I/O 等待
    print(f"[{name}] 请求完成!")
    return f"{name} 的数据 (耗时 {delay}s)"


async def main():
    """主异步函数"""
    print("=" * 50)
    print("演示 1: 顺序执行（总耗时 = sum of delays）")
    print("=" * 50)

    start = time.time()
    result1 = await fetch_data("API-1", 1.0)
    result2 = await fetch_data("API-2", 1.0)
    result3 = await fetch_data("API-3", 1.0)
    sequential_time = time.time() - start
    print(f"顺序执行总耗时: {sequential_time:.2f}s\n")

    print("=" * 50)
    print("演示 2: 并发执行（总耗时 = max of delays）")
    print("=" * 50)

    start = time.time()
    # TODO: 使用 asyncio.gather 并发执行三个 fetch_data 调用
    results = []
    concurrent_time = time.time() - start
    print(f"并发执行总耗时: {concurrent_time:.2f}s")
    print(f"结果: {results}\n")

    print("=" * 50)
    print("演示 3: 并发限制（同时最多 2 个任务）")
    print("=" * 50)

    start = time.time()
    tasks = [fetch_data(f"Task-{i}", 0.5) for i in range(6)]
    limited_results = []
    limit_time = time.time() - start
    print(f"并发限制执行总耗时: {limit_time:.2f}s")
    print(f"结果: {limited_results}")


if __name__ == "__main__":
    asyncio.run(main())
