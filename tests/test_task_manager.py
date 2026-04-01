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
    tm.create("Task 2")
    tm.update(t1.id, status="completed")
    pending = tm.list(status="pending")
    assert len(pending) == 1
