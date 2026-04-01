"""memory.py"""
import json
from pathlib import Path

class MemoryStore:
    def __init__(self, memdir: str = ".claude/memory"):
        self.memdir = Path(memdir)
        self.memdir.mkdir(parents=True, exist_ok=True)

    def save(self, key: str, value: dict) -> None:
        path = self.memdir / f"{key}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(value, f, ensure_ascii=False, indent=2)

    def load(self, key: str) -> dict | None:
        path = self.memdir / f"{key}.json"
        if not path.exists():
            return None
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    def list_keys(self) -> list[str]:
        return [p.stem for p in self.memdir.glob("*.json")]
