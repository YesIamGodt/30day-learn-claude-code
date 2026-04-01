"""retry.py — 指数退避重试装饰器"""
import asyncio
import logging
from functools import wraps
from typing import Tuple, Type

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

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
