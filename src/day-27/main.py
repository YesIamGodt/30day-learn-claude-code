"""main.py"""
from plugins import PluginManager

def main():
    pm = PluginManager()
    print("已加载插件:", pm.list_plugins())

    # 尝试加载一个不存在的插件
    loaded = pm.load_plugin("nonexistent")
    print(f"加载结果: {loaded}")

if __name__ == "__main__":
    main()
