"""plan_mode.py"""
from enum import Enum

class Mode(Enum):
    NORMAL = "normal"
    PLAN = "plan"

class PlanModeManager:
    def __init__(self):
        self.mode = Mode.NORMAL
        self.plan_history: list[str] = []
        self.pending_plan: str = ""

    def enter_plan(self) -> str:
        self.mode = Mode.PLAN
        return "进入计划模式。请描述你想做什么，我会先给出计划，确认后才执行。"

    def exit_plan(self) -> str:
        self.mode = Mode.NORMAL
        self.pending_plan = ""
        return "退出计划模式。"

    def is_plan_mode(self) -> bool:
        return self.mode == Mode.PLAN

    def save_plan(self, plan: str) -> None:
        self.pending_plan = plan
        self.plan_history.append(plan)

    async def execute_if_normal(self, action_fn):
        if self.is_plan_mode():
            return "[计划模式] 请先退出计划模式（/exit_plan）再执行。"
        return await action_fn()

    def approve_plan(self) -> str | None:
        if not self.pending_plan:
            return None
        plan = self.pending_plan
        self.pending_plan = ""
        return plan
