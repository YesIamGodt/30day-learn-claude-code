"""main.py"""
from task_manager import TaskManager

def main():
    tm = TaskManager()
    t1 = tm.create("完成 Day 17 教程")
    t2 = tm.create("复习前 16 天的内容")
    t3 = tm.create("开始 Day 18 学习")

    tm.update(t1.id, status="completed")
    tm.update(t2.id, status="in_progress")

    print("所有任务:")
    for t in tm.list():
        print(f"  [{t.id}] {t.title} ({t.status})")

    print("\n进行中:")
    for t in tm.list(status="in_progress"):
        print(f"  [{t.id}] {t.title}")

if __name__ == "__main__":
    main()
