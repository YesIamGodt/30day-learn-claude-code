"""day-20/main.py — 里程碑二：完整工具调用循环"""
import asyncio
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from task_manager import TaskManager
from plan_mode import PlanModeManager, Mode
from compactor import ContextCompactor
from history import ConversationHistory
from permission import PermissionSystem
from tools.registry import get_registry
from tools.bash import BashTool
from tools.file_read import FileReadTool
from tools.file_write import FileWriteTool


async def main():
    print("Claude Code — 里程碑二")
    print("=" * 50)

    # 初始化各组件
    task_mgr = TaskManager()
    plan_mgr = PlanModeManager()
    compactor = ContextCompactor()
    history = ConversationHistory()
    perms = PermissionSystem()

    registry = get_registry()
    registry.clear()
    registry.register(BashTool())
    registry.register(FileReadTool())
    registry.register(FileWriteTool())

    # 演示任务系统
    t1 = task_mgr.create("实现用户登录功能")
    t2 = task_mgr.create("编写单元测试")
    task_mgr.update(t1.id, status="in_progress")
    print(f"任务: {task_mgr.list()}")

    # 演示计划模式
    print(f"\n模式: {plan_mgr.mode.value}")
    print(plan_mgr.enter_plan())
    print(f"模式: {plan_mgr.mode.value}")
    plan_mgr.save_plan("1. 分析需求 2. 编写代码 3. 测试")
    print(plan_mgr.exit_plan())

    # 演示上下文压缩
    for i in range(10):
        history.add_message("user", f"操作 {i}")
    print(f"\n历史消息: {len(history.messages)}")
    print(f"需要压缩: {compactor.should_compact(history)}")
    compactor.compact(history, f"完成了 {len(history.messages)} 次操作")
    print(f"压缩后: {len(history.messages)}")

    print("\n里程碑二组件全部就绪！")

if __name__ == "__main__":
    asyncio.run(main())
