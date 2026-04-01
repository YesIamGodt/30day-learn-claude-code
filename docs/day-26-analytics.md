# Day 26: 分析与 Feature Flag — 灰度发布与 A/B 测试

## 目标

Feature Flag 允许你动态开启或关闭功能，无需重新部署。Claude Code 使用 Feature Flag 实现灰度发布和 A/B 测试。

## 骨架代码

```python
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
```

## 答案解析

<details>
<summary>点击展开 Day 26 答案</summary>

```python
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
```

</details>

## 延伸阅读
- [LaunchDarkly Feature Flags](https://docs.launchdarkly.com/)
- [Feature Flag Best Practices](https://featureflags.io/)
