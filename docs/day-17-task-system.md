# Day 17: 任务系统 — TaskCreate、TaskUpdate、TaskList

## 目标

今天我们将实现任务管理系统。Claude Code 可以创建和跟踪任务（Task），帮助用户管理复杂的多步骤工作。

## 骨架代码

```python
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
        # TODO: 找到任务并更新字段
        raise NotImplementedError

    def list(self, status: Status | None = None) -> list[Task]:
        # TODO: 返回任务列表，可按状态过滤
        raise NotImplementedError

    def get(self, id: str) -> Task | None:
        return self._tasks.get(id)
```

## 作业

### 题目 1：实现 update 方法
更新任务状态。

### 题目 2：实现 list 方法
支持按状态过滤。

## 答案解析

<details>
<summary>点击展开 Day 17 答案</summary>

```python
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
```

</details>

## 延伸阅读
- [任务管理 (Task Management) 设计模式](https://taskmanagement.dev/)
