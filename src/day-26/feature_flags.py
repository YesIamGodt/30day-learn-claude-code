"""feature_flags.py"""
from dataclasses import dataclass
import random

@dataclass
class FeatureFlag:
    name: str
    enabled: bool = False
    rollout_percent: float = 0.0

class FeatureFlagSystem:
    def __init__(self):
        self._flags: dict[str, FeatureFlag] = {}

    def set(self, name: str, enabled: bool = False, rollout: float = 0.0):
        self._flags[name] = FeatureFlag(name=name, enabled=enabled, rollout=rollout)

    def is_enabled(self, flag_name: str, user_id: str = "") -> bool:
        flag = self._flags.get(flag_name)
        if not flag:
            return False
        if flag.enabled:
            return True
        if flag.rollout_percent > 0:
            return random.random() < flag.rollout_percent
        return False
