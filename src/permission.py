"""permission.py — 权限系统"""

import re

DANGEROUS_PATTERNS = [
    re.compile(r"rm\s+-rf\s+/\s"),
    re.compile(r"rm\s+-rf\s+/tmp"),
    re.compile(r">\s*/etc/passwd"),
    re.compile(r"dd\s+if=.*of=/dev/"),
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
