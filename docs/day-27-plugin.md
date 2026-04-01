# Day 27: 插件系统 — 可扩展架构

## 目标

Claude Code 的插件系统允许第三方开发者扩展功能，无需修改核心代码。

## 骨架代码

```python
"""plugins.py"""
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec
import json

class PluginManager:
    def __init__(self, plugin_dir: str = ".claude/plugins"):
        self.plugin_dir = Path(plugin_dir)
        self._plugins: dict = {}

    def load_plugin(self, name: str) -> bool:
        # TODO: 动态加载 Python 文件作为插件
        raise NotImplementedError

    def unload_plugin(self, name: str):
        if name in self._plugins:
            del self._plugins[name]

    def list_plugins(self) -> list[str]:
        return list(self._plugins.keys())
```

## 答案解析

<details>
<summary>点击展开 Day 27 答案</summary>

```python
"""plugins.py"""
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec
import json
import sys

class PluginManager:
    def __init__(self, plugin_dir: str = ".claude/plugins"):
        self.plugin_dir = Path(plugin_dir)
        self._plugins: dict = {}

    def load_plugin(self, name: str) -> bool:
        path = self.plugin_dir / f"{name}.py"
        if not path.exists():
            return False
        spec = spec_from_file_location(name, path)
        module = module_from_spec(spec)
        sys.modules[name] = module
        spec.loader.exec_module(module)
        self._plugins[name] = module
        return True

    def unload_plugin(self, name: str):
        if name in self._plugins:
            del self._plugins[name]
        if name in sys.modules:
            del sys.modules[name]

    def list_plugins(self) -> list[str]:
        return list(self._plugins.keys())
```

</details>

## 延伸阅读
- [Python Plugin System Patterns](https://packaging.python.org/en/latest/tutorials/packaging-projects/)
