"""main.py — Day 11: 权限系统演示"""
from permission import PermissionSystem

def main():
    ps = PermissionSystem()
    commands = [
        "echo 'hello'",
        "ls -la",
        "rm -rf /",
        "git status",
    ]
    print("权限检查演示（auto_approve=False）\n")
    for cmd in commands:
        result = ps.check(cmd)
        print(f"  {cmd} -> {'允许' if result else '拒绝'}\n")

if __name__ == "__main__":
    main()
