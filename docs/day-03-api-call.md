# Day 3: 调用 Anthropic API — 与 AI 对话

## 目标

今天我们将学习如何使用 Python 的 `anthropic` SDK 真正调用 Claude API，发送消息并接收回复。这是整个 Claude Code 的"大脑"——没有 API 调用，就没有 AI 智能。

学完今天后，你将能：
- 使用 `anthropic.Anthropic()` 创建 API 客户端
- 构造消息列表（messages）并发送对话请求
- 处理 API 响应，提取 AI 的回复文本
- 理解错误处理（401 未授权、429 速率限制、500 服务器错误）

## 预习

- [Anthropic Python SDK 文档](https://docs.anthropic.com/en/api/client-sdks/python) — 官方 SDK 用法
- [Claude API 概览](https://docs.anthropic.com/en/api/messages) — 理解 messages API
- [API 错误处理最佳实践](https://docs.anthropic.com/en/api/errors) — 错误码含义

## 骨架代码

```python
"""day-03/main.py — Day 3: 调用 Anthropic API"""

import os
import sys
from typing import Optional
from anthropic import Anthropic, APIError, RateLimitError, AuthenticationError


def create_client(api_key: Optional[str] = None) -> Anthropic:
    """创建 Anthropic API 客户端"""
    # TODO: 从 api_key 参数或环境变量读取 API Key
    # 提示: key = api_key or os.environ.get("ANTHROPIC_API_KEY")
    # 如果 key 为 None，抛出 ValueError("未提供 API Key")
    key = None  # 替换为你的实现
    return Anthropic(api_key=key)


def send_message(
    client: Anthropic,
    message: str,
    model: str = "claude-opus-4-5",
) -> str:
    """发送消息给 Claude，返回 AI 的回复文本"""
    # TODO: 使用 client.messages.create() 发送请求
    # 参数: model, max_tokens=1024, messages=[{"role": "user", "content": message}]
    # 返回: response.content[0].text
    raise NotImplementedError("send_message 需要你实现")


def main() -> int:
    """主函数"""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("错误: 请设置 ANTHROPIC_API_KEY 环境变量", file=sys.stderr)
        return 1

    client = create_client(api_key)

    print("Claude Code AI 对话")
    print("=" * 50)
    print("输入消息与 Claude 对话，输入 'exit' 退出\n")

    while True:
        user_input = input("你: ").strip()
        if user_input.lower() in ("exit", "quit", "q"):
            print("再见!")
            break
        if not user_input:
            continue

        try:
            response = send_message(client, user_input)
            print(f"Claude: {response}\n")
        except AuthenticationError:
            print("错误: API Key 无效或已过期", file=sys.stderr)
            return 1
        except RateLimitError:
            print("错误: 请求频率超限，请稍后再试", file=sys.stderr)
            return 1
        except APIError as e:
            print(f"错误: API 返回错误 {e.status_code}: {e.body}", file=sys.stderr)
            return 1
        except Exception as e:
            print(f"错误: {type(e).__name__}: {e}", file=sys.stderr)
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
```

## 作业（填空题）

### 题目 1：完善 create_client

在 `create_client()` 函数中，补充 API Key 的读取逻辑：

```python
def create_client(api_key: Optional[str] = None) -> Anthropic:
    key = api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise ValueError("未提供 API Key（通过参数或环境变量 ANTHROPIC_API_KEY）")
    return Anthropic(api_key=key)
```

补充后测试：
```bash
ANTHROPIC_API_KEY=sk-xxx python src/day-03/main.py
```
（输入 `你好` 测试，观察输出）

### 题目 2：实现 send_message

补充 `send_message()` 函数，使用 `client.messages.create()` API：

```python
def send_message(
    client: Anthropic,
    message: str,
    model: str = "claude-opus-4-5",
) -> str:
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[
            {"role": "user", "content": message}
        ],
    )
    return response.content[0].text
```

运行后输入 `你好，Claude！` 测试 AI 回复。

### 题目 3：错误处理实验

故意制造不同的错误来测试你的错误处理：

1. **测试 401 错误**: 传入假的 API Key `sk-fake-key`，观察是否显示"API Key 无效"
2. **测试空消息**: 直接按回车，观察程序行为（是否跳过空消息）

思考：你觉得还需要处理哪些其他错误情况？

## 答案解析

<details>
<summary>点击展开 Day 3 完整答案</summary>

### 完整实现

```python
"""day-03/main.py — Day 3: 调用 Anthropic API"""

import os
import sys
from typing import Optional
from anthropic import Anthropic, APIError, RateLimitError, AuthenticationError


def create_client(api_key: Optional[str] = None) -> Anthropic:
    key = api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise ValueError("未提供 API Key（通过参数或环境变量 ANTHROPIC_API_KEY）")
    return Anthropic(api_key=key)


def send_message(
    client: Anthropic,
    message: str,
    model: str = "claude-opus-4-5",
) -> str:
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[
            {"role": "user", "content": message}
        ],
    )
    return response.content[0].text


def main() -> int:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("错误: 请设置 ANTHROPIC_API_KEY 环境变量", file=sys.stderr)
        return 1

    client = create_client(api_key)

    print("Claude Code AI 对话")
    print("=" * 50)
    print("输入消息与 Claude 对话，输入 'exit' 退出\n")

    while True:
        user_input = input("你: ").strip()
        if user_input.lower() in ("exit", "quit", "q"):
            print("再见!")
            break
        if not user_input:
            continue

        try:
            response = send_message(client, user_input)
            print(f"Claude: {response}\n")
        except AuthenticationError:
            print("错误: API Key 无效或已过期", file=sys.stderr)
            return 1
        except RateLimitError:
            print("错误: 请求频率超限，请稍后再试", file=sys.stderr)
            return 1
        except APIError as e:
            print(f"错误: API 返回错误 {e.status_code}: {e.body}", file=sys.stderr)
            return 1
        except Exception as e:
            print(f"错误: {type(e).__name__}: {e}", file=sys.stderr)
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
```

### 关键知识点

1. **Anthropic SDK**: `client.messages.create()` 是核心 API，包含 model/messages/max_tokens 参数
2. **错误分类**: `AuthenticationError`（401）、`RateLimitError`（429）、`APIError`（其他 HTTP 错误）
3. **对话循环**: `while True` + `input()` 实现 REPL 交互
4. **Role 字段**: messages 列表中的 "role" 字段区分 "user"（用户）和 "assistant"（AI）

</details>

## 延伸阅读

- [Anthropic Python SDK 完整文档](https://docs.anthropic.com/en/api/client-sdks/python)
- [Messages API 参考](https://docs.anthropic.com/en/api/messages)
- [理解 max_tokens 参数](https://docs.anthropic.com/en/api/chat) — 控制生成长度
