# Day 12: 上下文管理 — 动态上下文注入

## 目标

今天我们将实现上下文管理系统——在每次 AI 请求前，自动注入相关上下文（工作目录、当前时间、git 状态等）。上下文越丰富，AI 的回答越精准。

## 骨架代码

```python
"""context.py"""
from dataclasses import dataclass, field
from datetime import datetime
import subprocess

@dataclass
class ContextManager:
    cwd: str = field(default="")
    git_branch: str = ""
    git_status: str = ""

    def __post_init__(self):
        import os
        self.cwd = os.getcwd()
        self.git_branch = self._get_git_branch()
        self.git_status = self._get_git_status()

    def _get_git_branch(self) -> str:
        # TODO: 使用 subprocess.run 执行 git branch --show-current
        # 返回当前分支名或空字符串
        raise NotImplementedError

    def _get_git_status(self) -> str:
        # TODO: 使用 subprocess.run 执行 git status --porcelain
        # 返回简短的 git 状态
        raise NotImplementedError

    def build_system_prompt(self) -> str:
        return (
            f"当前目录: {self.cwd}\n"
            f"Git 分支: {self.git_branch}\n"
            f"Git 状态: {self.git_status or '干净'}\n"
        )
```

## 作业

### 题目 1：实现 _get_git_branch
```python
def _get_git_branch(self) -> str:
    try:
        result = subprocess.run(
            ["git", "branch", "--show-current"],
            capture_output=True, text=True, timeout=5,
        )
        return result.stdout.strip()
    except Exception:
        return ""
```

### 题目 2：实现 _get_git_status
```python
def _get_git_status(self) -> str:
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True, timeout=5,
        )
        return result.stdout.strip()
    except Exception:
        return ""
```

## 答案解析

<details>
<summary>点击展开 Day 12 答案</summary>

```python
"""context.py — 上下文管理器"""
from dataclasses import dataclass, field
import subprocess

@dataclass
class ContextManager:
    cwd: str = ""
    git_branch: str = ""
    git_status: str = ""

    def __post_init__(self):
        import os
        self.cwd = os.getcwd()
        self.git_branch = self._get_git_branch()
        self.git_status = self._get_git_status()

    def _get_git_branch(self) -> str:
        try:
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                capture_output=True, text=True, timeout=5,
            )
            return result.stdout.strip()
        except Exception:
            return ""

    def _get_git_status(self) -> str:
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                capture_output=True, text=True, timeout=5,
            )
            return result.stdout.strip()
        except Exception:
            return ""

    def build_system_prompt(self) -> str:
        return (
            f"当前目录: {self.cwd}\n"
            f"Git 分支: {self.git_branch}\n"
            f"Git 状态: {self.git_status or '干净'}\n"
        )
```

</details>

## 延伸阅读
- [Git 命令行工具](https://git-scm.com/docs)
