"""commands.py"""
from dataclasses import dataclass
from typing import Callable, Awaitable

@dataclass
class Command:
    name: str
    description: str
    handler: Callable[..., Awaitable[str]]

class CommandRegistry:
    def __init__(self):
        self._commands: dict[str, Command] = {}

    def register(self, name: str, description: str, handler: Callable[..., Awaitable[str]]):
        self._commands[name] = Command(name=name, description=description, handler=handler)

    def get(self, name: str) -> Command | None:
        return self._commands.get(name)

    def is_command(self, text: str) -> bool:
        if not text.startswith("/"):
            return False
        cmd_name = text[1:].split()[0]
        return cmd_name in self._commands

    def list_all(self) -> list[Command]:
        return list(self._commands.values())
