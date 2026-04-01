"""day-30/main.py — 最终完整版 Claude Code"""
import asyncio
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from history import ConversationHistory
from token_counter import TokenCounter
from context import ContextManager
from tools.registry import get_registry
from tools.bash import BashTool
from tools.file_read import FileReadTool
from tools.file_write import FileWriteTool
from permission import PermissionSystem
from config import Config
from task_manager import TaskManager
from plan_mode import PlanModeManager
from compactor import ContextCompactor
from memory import MemoryStore
from skill import SkillRunner
from agent import Agent, AgentTeam
from mcp_client import MCPClient
from feature_flags import FeatureFlagSystem


class ClaudeCode:
    """完整的 Claude Code 实现"""

    def __init__(self, config: Config):
        self.config = config
        self.history = ConversationHistory()
        self.counter = TokenCounter()
        self.ctx = ContextManager()
        self.permissions = PermissionSystem()
        self.tasks = TaskManager()
        self.plan = PlanModeManager()
        self.compactor = ContextCompactor()
        self.memory = MemoryStore()
        self.skills = SkillRunner()
        self.flags = FeatureFlagSystem()

        registry = get_registry()
        registry.clear()
        registry.register(BashTool())
        registry.register(FileReadTool())
        registry.register(FileWriteTool())

    async def chat(self, prompt: str) -> str:
        """处理用户消息"""
        if self.compactor.should_compact(self.history):
            self.compactor.compact(self.history, "[对话已压缩]")
        return f"[Claude Code] 已收到: {prompt}"


async def main():
    print("=" * 50)
    print("《从 0 到 1 30 天实现 Claude Code》")
    print("最终完整版")
    print("=" * 50)
    print()
    print("组件就绪:")
    print("  [x] ConversationHistory — 对话历史")
    print("  [x] TokenCounter — 成本跟踪")
    print("  [x] ContextManager — 上下文管理")
    print("  [x] PermissionSystem — 权限控制")
    print("  [x] TaskManager — 任务系统")
    print("  [x] PlanModeManager — 计划模式")
    print("  [x] ContextCompactor — 上下文压缩")
    print("  [x] MemoryStore — 记忆系统")
    print("  [x] SkillRunner — Skill 系统")
    print("  [x] AgentTeam — 子 Agent")
    print("  [x] MCPClient — MCP 协议")
    print("  [x] FeatureFlagSystem — Feature Flag")
    print()
    print("🎉 恭喜你完成了 30 天教程！")
    print()
    print("下一步:")
    print("  1. 阅读 docs/day-30-final.md 查看完整总结")
    print("  2. 运行 python src/day-15/main.py 体验最小可用 CLI")
    print("  3. 补充各 Day 骨架代码中的 TODO 部分")
    print("  4. 研究原版 Claude Code 源码")


if __name__ == "__main__":
    asyncio.run(main())
