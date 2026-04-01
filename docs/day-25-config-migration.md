# Day 25: 配置迁移 — 多版本配置兼容

## 目标

Claude Code 支持配置迁移，确保旧版本配置能平滑升级到新版本。

## 骨架代码

```python
"""migration.py"""
from pathlib import Path
import json

MIGRATIONS = []

def register_migration(version: str, migration_fn):
    MIGRATIONS.append((version, migration_fn))

def migrate_config(config_path: str = ".claude.json") -> dict:
    # TODO: 读取配置文件，依次应用所有迁移
    raise NotImplementedError

register_migration("0.1.0", lambda cfg: {**cfg, "version": "0.1.0"})
register_migration("0.2.0", lambda cfg: {**cfg, "max_turns": cfg.get("max_turns", 30)})
```

## 答案解析

<details>
<summary>点击展开 Day 25 答案</summary>

```python
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
```

</details>

## 延伸阅读
- [Configuration Migration Patterns](https://docs.microsoft.com/en-us/aspnet/core/migration/)
