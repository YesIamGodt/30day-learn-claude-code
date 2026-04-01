"""main.py"""
from memory import MemoryStore

def main():
    store = MemoryStore()
    store.save("user-prefs", {"name": "Claude", "theme": "dark", "model": "claude-sonnet-4-6"})
    store.save("project-info", {"name": "MyProject", "language": "python"})

    print("记忆键:", store.list_keys())
    prefs = store.load("user-prefs")
    print("用户偏好:", prefs)

if __name__ == "__main__":
    main()
