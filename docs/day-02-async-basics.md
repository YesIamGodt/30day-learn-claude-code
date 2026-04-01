# Day 2: Python 异步编程基础 — asyncio 事件循环

## 目标

今天我们将学习 Python 的 `asyncio` 模块，理解什么是异步编程、为什么 Claude Code 需要它，以及如何用 `async/await` 编写并发代码。

学完今天后，你将能：
- 理解事件循环、协程、async/await 的概念
- 用 `asyncio.run()` 启动异步程序
- 用 `asyncio.gather()` 并发执行多个协程
- 理解为什么 AI API 调用必须用异步

## 预习

- [asyncio 官方文档](https://docs.python.org/3/library/asyncio.html) — Python 异步编程核心
- [AsyncIO 教程 — Real Python](https://realpython.com/async-python/) — 深入理解事件循环
- [什么是协程？](https://www.geeksforgeeks.org/coroutine-in-python/) — 协程 vs 线程

## 骨架代码

```python
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
    # 提示: results = await asyncio.gather(...)
    results = []
    concurrent_time = time.time() - start
    print(f"并发执行总耗时: {concurrent_time:.2f}s")
    print(f"结果: {results}\n")

    print("=" * 50)
    print("演示 3: 并发限制（同时最多 2 个任务）")
    print("=" * 50)

    # TODO: 实现一个简单的信号量限制，同时最多运行 2 个任务
    # 提示: 使用 asyncio.Semaphore(2)
    start = time.time()
    tasks = [fetch_data(f"Task-{i}", 0.5) for i in range(6)]
    limited_results = []
    limit_time = time.time() - start
    print(f"并发限制执行总耗时: {limit_time:.2f}s")
    print(f"结果: {limited_results}")


if __name__ == "__main__":
    asyncio.run(main())
```

## 作业（填空题）

### 题目 1：实现并发执行

在 `main()` 的"演示 2"部分，补充 `asyncio.gather()` 调用。

`asyncio.gather()` 可以同时运行多个协程并收集它们的结果：

```python
results = await asyncio.gather(
    fetch_data("API-1", 1.0),
    fetch_data("API-2", 1.0),
    fetch_data("API-3", 1.0),
)
```

补充后运行 `python src/day-02/main.py`，观察：
1. 顺序执行总耗时是多少？
2. 并发执行总耗时是多少？
3. 为什么两者耗时不同？

### 题目 2：实现信号量限制

在"演示 3"中，使用 `asyncio.Semaphore` 限制同时最多 2 个任务：

```python
semaphore = asyncio.Semaphore(2)

async def limited_fetch(name: str, delay: float) -> str:
    async with semaphore:
        return await fetch_data(name, delay)
```

将 `tasks` 列表改为使用 `limited_fetch`，然后用 `asyncio.gather()` 执行。
运行后观察耗时，理解信号量的作用。

### 题目 3：思考题

Claude Code 在调用 AI API 时，每个工具调用（比如 BashTool 执行一条命令）都是一次异步 I/O 操作。

思考：如果不采用异步，而用同步代码调用 10 个工具，每个工具平均耗时 0.5 秒，最少需要多少秒？
如果采用异步并发调用 10 个工具，最少需要多少秒？

## 答案解析

<details>
<summary>点击展开 Day 2 完整答案</summary>

### 题目 1 答案

```python
results = await asyncio.gather(
    fetch_data("API-1", 1.0),
    fetch_data("API-2", 1.0),
    fetch_data("API-3", 1.0),
)
```

运行结果：
- 顺序执行：约 3.00s（1+1+1）
- 并发执行：约 1.00s（三个 sleep 同时发生）
- 结论：异步让 I/O 等待期间可以执行其他任务

### 题目 2 答案

```python
semaphore = asyncio.Semaphore(2)

async def limited_fetch(name: str, delay: float) -> str:
    async with semaphore:
        return await fetch_data(name, delay)

start = time.time()
tasks = [limited_fetch(f"Task-{i}", 0.5) for i in range(6)]
limited_results = await asyncio.gather(*tasks)
limit_time = time.time() - start
```

运行结果：约 1.5s（3 批，每批 2 个任务 × 0.5s）
信号量的作用：限制并发数，防止资源耗尽。

### 关键知识点

1. **事件循环**: Python 的 asyncio 事件循环（Event Loop）负责调度协程，在 I/O 等待时切换任务
2. **await 的含义**: `await` 等待一个协程完成，如果该协程在等待 I/O，事件循环会切换去执行其他协程
3. **gather 的作用**: `asyncio.gather()` 将多个协程打包并发执行，返回结果列表

</details>

## 延伸阅读

- [Python asyncio 深度指南](https://docs.python.org/3/library/asyncio.html)
- [Real Python: AsyncIO 教程](https://realpython.com/async-python/)
- [asyncio.gather vs asyncio.TaskGroup](https://docs.python.org/3/library/asyncio-task.html#asyncio.gather)
