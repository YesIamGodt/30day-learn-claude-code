"""plugins.py"""
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec
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
