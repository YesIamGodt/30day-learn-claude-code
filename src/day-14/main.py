"""main.py"""
from config import Config

def main():
    cfg = Config.load(".claude.json")
    print(f"模型: {cfg.model}, 最大Token: {cfg.max_tokens}")
    cfg.model = "claude-sonnet-4-6"
    cfg.save(".claude.json")
    print("配置已保存")

if __name__ == "__main__":
    main()
