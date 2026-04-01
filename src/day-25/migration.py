"""migration.py"""
from pathlib import Path
import json

MIGRATIONS = []

def register_migration(version: str, migration_fn):
    MIGRATIONS.append((version, migration_fn))

def migrate_config(config_path: str = ".claude.json") -> dict:
    path = Path(config_path)
    if not path.exists():
        return {"version": "0.1.0", "model": "claude-opus-4-5", "max_tokens": 4096}

    with open(path) as f:
        config = json.load(f)

    for version, migration_fn in sorted(MIGRATIONS):
        if config.get("version", "0.0.0") < version:
            config = migration_fn(config)
            config["version"] = version

    return config
