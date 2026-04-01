# Day 14: 配置管理 — YAML 配置与 Pydantic 验证

## 目标

今天我们将实现配置管理系统。Claude Code 需要保存用户偏好（API Key、模型选择、权限模式等），我们用 YAML 文件持久化配置，用 Pydantic 验证配置合法性。

## 骨架代码

```python
"""config.py"""
from pydantic import BaseModel, Field
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
        # TODO: 从 YAML 文件读取配置
        # 如果文件不存在，返回默认 Config()
        raise NotImplementedError

    def save(self, path: str = ".claude.json") -> None:
        # TODO: 将配置写入 YAML 文件
        raise NotImplementedError
```

## 作业

### 题目 1：实现 load 方法
```python
@classmethod
def load(cls, path: str = ".claude.json") -> "Config":
    p = Path(path)
    if not p.exists():
        return cls()
    with open(p) as f:
        data = yaml.safe_load(f) or {}
    return cls(**data)
```

### 题目 2：实现 save 方法
```python
def save(self, path: str = ".claude.json") -> None:
    with open(path, "w") as f:
        yaml.dump(self.model_dump(), f, default_flow_style=False)
```

## 答案解析

<details>
<summary>点击展开 Day 14 答案</summary>

```python
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
```

</details>

## 延伸阅读
- [Pydantic v2 文档](https://docs.pydantic.dev/latest/)
- [YAML 语法](https://yaml.org/spec/1.2.2/)
