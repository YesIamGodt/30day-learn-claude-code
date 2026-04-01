# Day 22: 记忆系统 — 持久化记忆

## 目标

Claude Code 可以记住用户偏好和项目信息，下次使用时自动加载。这是通过持久化记忆文件实现的。

## 骨架代码

```python
"""memory.py"""
import json
from pathlib import Path

class MemoryStore:
    def __init__(self, memdir: str = ".claude/memory"):
        self.memdir = Path(memdir)
        self.memdir.mkdir(parents=True, exist_ok=True)

    def save(self, key: str, value: dict) -> None:
        # TODO: 保存到 self.memdir / f"{key}.json"
        raise NotImplementedError

    def load(self, key: str) -> dict | None:
        # TODO: 从文件读取
        raise NotImplementedError

    def list_keys(self) -> list[str]:
        # TODO: 列出所有记忆键
        raise NotImplementedError
```

## 答案解析

<details>
<summary>点击展开 Day 22 答案</summary>

```python
"""memory.py"""
import json
from pathlib import Path

class MemoryStore:
    def __init__(self, memdir: str = ".claude/memory"):
        self.memdir = Path(memdir)
        self.memdir.mkdir(parents=True, exist_ok=True)

    def save(self, key: str, value: dict) -> None:
        path = self.memdir / f"{key}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(value, f, ensure_ascii=False, indent=2)

    def load(self, key: str) -> dict | None:
        path = self.memdir / f"{key}.json"
        if not path.exists():
            return None
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    def list_keys(self) -> list[str]:
        return [p.stem for p in self.memdir.glob("*.json")]
```

</details>

## 延伸阅读
- [Claude Code Memory](https://docs.anthropic.com/en/docs/build/claude-code/memory)
