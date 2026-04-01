"""main.py"""
import asyncio
from commands import CommandRegistry

async def help_handler():
    return "可用命令: /help, /model, /config, /clear, /exit"

async def model_handler(args: str):
    return f"切换模型到: {args or 'claude-sonnet-4-6'}"

async def config_handler():
    return "当前配置: model=claude-opus-4-5, max_tokens=4096"

async def main():
    registry = CommandRegistry()
    registry.register("help", "显示帮助信息", help_handler)
    registry.register("model", "切换模型", model_handler)
    registry.register("config", "显示配置", config_handler)

    for cmd in registry.list_all():
        print(f"/{cmd.name}: {cmd.description}")

    print()
    result = await registry.get("help").handler()
    print(f"/help -> {result}")

if __name__ == "__main__":
    asyncio.run(main())
