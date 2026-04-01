"""main.py — Day 7: 对话历史演示"""

from history import ConversationHistory


async def main():
    history = ConversationHistory()
    max_tokens = 100

    print(f"最大 Token 数: {max_tokens}")
    print("=" * 50)

    history.add_message("system", "你是一个友好的 Python 编程助手。")
    print(f"[系统消息] Token 数: {history.count_tokens()}")

    exchanges = [
        ("user", "你好，请介绍一下 Python。"),
        ("assistant", "Python 是一种高级编程语言，由 Guido van Rossum 创建。"),
        ("user", "它最适合做什么？"),
        ("assistant", "Python 最适合：数据分析、Web 开发、AI/ML、自动化脚本。"),
        ("user", "能给我一个 Web 框架的例子吗？"),
        ("assistant", "Flask 是一个轻量级 Web 框架，适合小中型应用。"),
    ]

    for role, content in exchanges:
        history.add_message(role, content)
        total = history.count_tokens()
        print(f"[{role}] {total} tokens")
        if total > max_tokens:
            print(f"  超过限制，开始截断...")
            history.truncate(max_tokens)
            print(f"  截断后: {history.count_tokens()} tokens，保留 {len(history.messages)} 条消息")

    print()
    print(f"最终历史：{len(history.messages)} 条消息，{history.count_tokens()} tokens")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
