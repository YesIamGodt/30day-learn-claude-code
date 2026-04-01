"""day-03/main.py — Day 3: 调用 Anthropic API"""

import os
import sys
from typing import Optional
from anthropic import Anthropic, APIError, RateLimitError, AuthenticationError


def create_client(api_key: Optional[str] = None) -> Anthropic:
    """创建 Anthropic API 客户端"""
    key = api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise ValueError("未提供 API Key（通过参数或环境变量 ANTHROPIC_API_KEY）")
    return Anthropic(api_key=key)


def send_message(
    client: Anthropic,
    message: str,
    model: str = "claude-opus-4-5",
) -> str:
    """发送消息给 Claude，返回 AI 的回复文本"""
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[
            {"role": "user", "content": message}
        ],
    )
    return response.content[0].text


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
