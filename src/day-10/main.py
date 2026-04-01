"""main.py"""
import asyncio
from repl import REPL

if __name__ == "__main__":
    asyncio.run(REPL().run())
