# Day 29: 测试与 CI — 用 pytest + GitHub Actions 保证质量

## 目标

今天我们将用 pytest 编写测试，并用 GitHub Actions 配置 CI，确保每次提交都通过自动化测试。

## 骨架代码

```python
"""tests/test_tools.py"""
import pytest
from src.day_05.tools.bash import BashTool
from src.day_05.tools.file_read import FileReadTool

@pytest.mark.asyncio
async def test_bash_tool():
    tool = BashTool()
    result = await tool.execute("echo 'hello'")
    assert "hello" in result

@pytest.mark.asyncio
async def test_file_read_tool(tmp_path):
    tool = FileReadTool()
    test_file = tmp_path / "test.txt"
    test_file.write_text("Hello, Test!")

    result = await tool.execute(str(test_file))
    assert result == "Hello, Test!"
```

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.10" }
      - run: pip install -e .
      - run: pytest
```

## 作业

### 题目 1：编写 TaskManager 测试
测试 create、update、list 方法。

### 题目 2：编写 FeatureFlagSystem 测试
测试 enabled 和 rollout_percent。

## 答案解析

<details>
<summary>点击展开 Day 29 答案</summary>

```python
"""tests/test_task_manager.py"""
import pytest
from src.day_17.task_manager import TaskManager

def test_create_task():
    tm = TaskManager()
    task = tm.create("Test task")
    assert task.title == "Test task"
    assert task.status == "pending"

def test_update_task():
    tm = TaskManager()
    task = tm.create("Test")
    tm.update(task.id, status="completed")
    assert tm.get(task.id).status == "completed"

def test_list_filter():
    tm = TaskManager()
    t1 = tm.create("Task 1")
    t2 = tm.create("Task 2")
    tm.update(t1.id, status="completed")
    pending = tm.list(status="pending")
    assert len(pending) == 1
```

</details>

## 延伸阅读
- [pytest 文档](https://docs.pytest.org/)
- [GitHub Actions 入门](https://docs.github.com/en/actions/quickstart)
