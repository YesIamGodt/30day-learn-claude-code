"""task_manager.py"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal

Status = Literal["pending", "in_progress", "completed", "blocked"]

@dataclass
class Task:
    id: str
    title: str
    status: Status = "pending"
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    metadata: dict = field(default_factory=dict)

class TaskManager:
    def __init__(self):
        self._tasks: dict[str, Task] = {}
        self._counter = 0

    def create(self, title: str) -> Task:
        self._counter += 1
        task = Task(id=str(self._counter), title=title)
        self._tasks[task.id] = task
        return task

    def update(self, id: str, **kwargs) -> Task | None:
        task = self._tasks.get(id)
        if not task:
            return None
        for key, value in kwargs.items():
            if hasattr(task, key):
                setattr(task, key, value)
        task.updated_at = datetime.now()
        return task

    def list(self, status: Status | None = None) -> list[Task]:
        tasks = list(self._tasks.values())
        if status:
            tasks = [t for t in tasks if t.status == status]
        return sorted(tasks, key=lambda t: t.created_at)

    def get(self, id: str) -> Task | None:
        return self._tasks.get(id)
