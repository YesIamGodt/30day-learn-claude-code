"""main.py"""
from feature_flags import FeatureFlagSystem

def main():
    flags = FeatureFlagSystem()
    flags.set("new_ui", enabled=True)
    flags.set("beta_search", rollout=0.1)

    print(f"new_ui 开启: {flags.is_enabled('new_ui')}")
    print(f"beta_search 开启: {flags.is_enabled('beta_search')}")
    print(f"unknown_flag: {flags.is_enabled('unknown_flag')}")

if __name__ == "__main__":
    main()
