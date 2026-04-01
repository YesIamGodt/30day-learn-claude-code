# Day 13: 错误处理与重试 — 健壮性的关键

## 目标

今天我们将实现错误处理和重试机制。AI API 调用会遇到各种错误（网络中断、限流、服务器错误），健壮的程序必须能优雅地处理这些问题。

## 骨架代码

```python
"""retry.py"""
import asyncio
import time
import logging
from functools import wraps

logger = logging.getLogger(__name__)

def retry(max_attempts: int = 3, base_delay: float = 1.0):
    """指数退避重试装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"{func.__name__} 失败 (尝试 {attempt+1}/{max_attempts}), {delay:.1f}s 后重试: {e}")
                    await asyncio.sleep(delay)
        return wrapper
    return decorator
```

## 作业

### 题目 1：实现带异常过滤的重试
只在特定异常类型上重试。

### 题目 2：实现日志配置
```python
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
```

## 答案解析

<details>
<summary>点击展开 Day 13 答案</summary>

```python
"""retry.py — 指数退避重试装饰器"""
import asyncio
import time
import logging
from functools import wraps
from typing import Type, Tuple

logger = logging.getLogger(__name__)

def retry(max_attempts: int = 3, base_delay: float = 1.0, exceptions: Tuple[Type[Exception], ...] = (Exception,)):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts - 1:
                        raise
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"{func.__name__} 失败 (尝试 {attempt+1}/{max_attempts}), {delay:.1f}s 后重试: {e}")
                    await asyncio.sleep(delay)
        return wrapper
    return decorator
```

</details>

## 延伸阅读
- [Python logging 官方文档](https://docs.python.org/3/library/logging.html)
- [Exponential Backoff 策略](https://aws.amazon.com/cn/blogs/architecture/exponential-backoff-and-jitter/)
