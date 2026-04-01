# Day 11: 权限系统 — 工具调用的安全门卫

## 目标

今天我们将实现权限系统——在执行危险操作前请求用户确认。Claude Code 能执行任意 shell 命令，这既强大又危险。权限系统确保用户知道并在关键时刻把关。

学完今天后，你将能：
- 实现 always_allow 规则（白名单）
- 实现用户审批提示
- 区分危险命令和普通命令

## 作业

### 题目 1：实现危险命令识别
识别 rm -rf / 等危险命令。

### 题目 2：实现用户确认
input("是否执行？ (y/N): ") 交互。

## 答案解析

<details>
<summary>点击展开 Day 11 答案</summary>

```python
"""permission.py"""
import re

DANGEROUS_PATTERNS = [
    re.compile(r"rm\s+-rf\s+/\s"),
    re.compile(r"rm\s+-rf\s+/tmp"),
    re.compile(r">\s*/etc/passwd"),
    re.compile(r"dd\s+if=.*of=/dev/"),
    re.compile(r":\(\)\{:\|:&\};:"),
]

ALWAYS_ALLOW = [
    "echo", "pwd", "ls", "cat", "head", "tail", "grep",
    "find", "wc", "sort", "uniq", "date", "whoami",
]

class PermissionSystem:
    def __init__(self, auto_approve: bool = False):
        self.auto_approve = auto_approve

    def is_dangerous(self, command: str) -> bool:
        for pattern in DANGEROUS_PATTERNS:
            if pattern.search(command):
                return True
        return False

    def is_always_allowed(self, command: str) -> bool:
        first_word = command.strip().split()[0] if command.strip() else ""
        return first_word in ALWAYS_ALLOW

    def check(self, command: str) -> bool:
        if self.auto_approve or self.is_always_allowed(command):
            return True
        if self.is_dangerous(command):
            print(f"\n警告 危险命令检测: {command}")
            response = input("是否执行？ (y/N): ").strip().lower()
            return response == "y"
        response = input(f"\n执行命令: {command}? (y/N): ").strip().lower()
        return response == "y"
```

</details>

## 延伸阅读

- [OWASP 命令注入防护](https://owasp.org/www-community/attacks/Command_Injection)
