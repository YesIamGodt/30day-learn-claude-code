"""main.py"""
import asyncio
from plan_mode import PlanModeManager, Mode

async def main():
    pm = PlanModeManager()
    print(f"当前模式: {pm.mode.value}")

    print(pm.enter_plan())
    print(f"当前模式: {pm.mode.value}")

    pm.save_plan("1. 创建目录 2. 写文件 3. 测试")
    print(f"待审批计划: {pm.pending_plan}")

    approved = pm.approve_plan()
    print(f"已批准计划: {approved}")

    print(pm.exit_plan())
    print(f"当前模式: {pm.mode.value}")

if __name__ == "__main__":
    asyncio.run(main())
