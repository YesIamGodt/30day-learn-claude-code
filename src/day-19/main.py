"""main.py"""
from compactor import ContextCompactor
from history import ConversationHistory

def main():
    history = ConversationHistory()
    compactor = ContextCompactor(max_messages=5)

    for i in range(8):
        history.add_message("user", f"消息 {i}")

    print(f"消息数: {len(history.messages)}")
    print(f"需要压缩: {compactor.should_compact(history)}")

    compactor.compact(history, "用户执行了 8 次操作，主要是文件读写和命令执行。")
    print(f"压缩后消息数: {len(history.messages)}")
    for m in history.messages:
        print(f"  {m.role}: {m.content[:50]}")

if __name__ == "__main__":
    main()
