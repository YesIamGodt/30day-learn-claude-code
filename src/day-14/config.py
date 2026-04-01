"""config.py"""
from pydantic import BaseModel
from pathlib import Path
import yaml

class Config(BaseModel):
    api_key: str = ""
    model: str = "claude-opus-4-5"
    max_tokens: int = 4096
    permission_auto_approve: bool = False
    config_file: str = ".claude.json"

    @classmethod
    def load(cls, path: str = ".claude.json") -> "Config":
        p = Path(path)
        if not p.exists():
            return cls()
        with open(p) as f:
            data = yaml.safe_load(f) or {}
        return cls(**data)

    def save(self, path: str = ".claude.json") -> None:
        with open(path, "w") as f:
            yaml.dump(self.model_dump(), f, default_flow_style=False)
