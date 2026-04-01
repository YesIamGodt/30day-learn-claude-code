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
