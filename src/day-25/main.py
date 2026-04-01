"""main.py"""
from migration import migrate_config, register_migration

register_migration("0.1.0", lambda cfg: {**cfg, "version": "0.1.0"})
register_migration("0.2.0", lambda cfg: {**cfg, "max_turns": cfg.get("max_turns", 30)})

def main():
    cfg = migrate_config(".claude.json")
    print(f"配置版本: {cfg.get('version')}")
    print(f"模型: {cfg.get('model')}")

if __name__ == "__main__":
    main()
