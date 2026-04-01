"""main.py"""
from context import ContextManager

def main():
    ctx = ContextManager()
    print("上下文信息:")
    print(ctx.build_system_prompt())

if __name__ == "__main__":
    main()
