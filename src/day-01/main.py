"""day-01/main.py — Day 1: Python CLI 基础"""

import argparse
import sys
import os
from typing import Optional


def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Claude Code — 你的 AI 编程助手",
        epilog="使用 --prompt 指定你想让 AI 做的事",
    )

    parser.add_argument(
        "prompt",
        type=str,
        help="你想让 AI 做什么？",
    )

    parser.add_argument(
        "--model",
        type=str,
        default="claude-opus-4-5",
        help="使用的模型名称",
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        help="显示详细调试信息",
    )

    parser.add_argument(
        "--api-key",
        type=str,
        default=None,
        help="Anthropic API Key（也可设置 ANTHROPIC_API_KEY 环境变量）",
    )

    return parser


def validate_args(args: argparse.Namespace) -> Optional[str]:
    if not args.prompt or not args.prompt.strip():
        return "错误: prompt 不能为空"

    if args.api_key is None:
        args.api_key = os.environ.get("ANTHROPIC_API_KEY")

    if args.api_key is None:
        return "错误: 请提供 API Key（通过 --api-key 或环境变量 ANTHROPIC_API_KEY）"

    return None


def main() -> int:
    parser = create_parser()
    args = parser.parse_args()

    error = validate_args(args)
    if error:
        print(error, file=sys.stderr)
        return 1

    print("=" * 50)
    print("Claude Code 启动中...")
    print(f"  模型: {args.model}")
    print(f"  任务: {args.prompt}")
    if args.verbose:
        print(f"  API Key: {args.api_key[:8]}..." if args.api_key else "  API Key: (未设置)")
    print("=" * 50)

    print("\n[Day 1 完成] 基础 CLI 参数解析已就绪。")
    print("后续学习:")
    print("  Day 2: Python 异步编程基础")
    print("  Day 3: 调用 Anthropic API 与 AI 对话")

    return 0


if __name__ == "__main__":
    sys.exit(main())
