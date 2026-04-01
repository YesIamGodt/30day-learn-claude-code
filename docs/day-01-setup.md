# Day 1: Python CLI 基础 — 用 argparse 构建命令行程序

## 目标

今天我们将学习 Python 标准库中的 `argparse` 模块，并用它构建一个能接受命令行参数的程序。这是整个 Claude Code 的入口基础。

学完今天后，你将能：
- 使用 `argparse` 定义必选参数和可选参数
- 区分位置参数（positional）和可选参数（optional）
- 实现 `--help` 帮助信息

## 预习

在开始之前，请了解以下概念：

- [argparse — 命令行参数解析](https://docs.python.org/3/library/argparse.html) — Python 标准库文档
- [sys.argv 的工作原理](https://realpython.com/python-command-line-arguments/) — 理解命令行参数的底层机制

## 骨架代码

```python
"""day-01/main.py — Day 1: Python CLI 基础"""

import argparse
import sys
import os
from typing import Optional


def create_parser() -> argparse.ArgumentParser:
    """创建并配置 argument parser"""
    parser = argparse.ArgumentParser(
        description="Claude Code — 你的 AI 编程助手",
        epilog="使用 --prompt 指定你想让 AI 做的事",
    )

    # 位置参数：用户想做的事情
    parser.add_argument(
        "prompt",
        type=str,
        help="你想让 AI 做什么？",
    )

    # 可选参数：--model
    parser.add_argument(
        "--model",
        type=str,
        default="claude-opus-4-5",
        help="使用的模型名称",
    )

    # 可选参数：--verbose
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="显示详细调试信息",
    )

    # 可选参数：--api-key
    parser.add_argument(
        "--api-key",
        type=str,
        default=None,
        help="Anthropic API Key（也可设置 ANTHROPIC_API_KEY 环境变量）",
    )

    return parser


def validate_args(args: argparse.Namespace) -> Optional[str]:
    """验证参数合法性，返回错误信息或 None（无错误）"""
    if not args.prompt or not args.prompt.strip():
        return "错误: prompt 不能为空"

    if args.api_key is None:
        args.api_key = os.environ.get("ANTHROPIC_API_KEY")

    if args.api_key is None:
        return "错误: 请提供 API Key（通过 --api-key 或环境变量 ANTHROPIC_API_KEY）"

    return None


def main() -> int:
    """主入口函数，返回退出码（0=成功，非0=失败）"""
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
```

## 作业（填空题）

### 题目 1：完善 ArgumentParser 配置

在 `create_parser()` 函数中，观察已有的 `add_argument()` 调用，理解：
- 位置参数：没有前缀的名称（`"prompt"`）
- 可选参数：有 `--` 前缀的名称（`"--model"`, `"--verbose"`, `"--api-key"`）
- `action="store_true"` 让参数变成布尔开关
- `default` 设置默认值

运行以下命令验证你的理解：

```bash
# 查看帮助信息
python src/day-01/main.py --help
```

### 题目 2：实现参数验证

在 `validate_args()` 函数中，已给出完整的实现。请仔细阅读代码，回答：
1. 当用户输入空字符串 `""` 作为 prompt 时，会返回什么错误信息？
2. 当用户不传 `--api-key` 时，程序从哪里读取 API Key？
3. 当环境变量 `ANTHROPIC_API_KEY` 也不存在时，提示信息是什么？

### 题目 3：动手实验

修改 `main()` 函数，在打印"Claude Code 启动中..."之前，添加一行打印当前工作目录：

```python
print(f"  工作目录: {os.getcwd()}")
```

运行 `python src/day-01/main.py "你好" --verbose`，观察输出。

## 答案解析

<details>
<summary>点击展开 Day 1 完整答案</summary>

### 完整实现

```python
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
```

### 关键知识点

1. **位置参数 vs 可选参数**: 位置参数不带前缀，可选参数带 `--` 前缀
2. **action="store_true"**: 这是一种常用模式，让 `--verbose` 成为一个布尔开关
3. **环境变量回退**: 先尝试命令行参数，再回退到环境变量，这是 CLI 工具的标准实践

</details>

## 延伸阅读

- [Python argparse 官方教程](https://docs.python.org/3/howto/argparse.html)
- [Real Python: Python 命令行参数](https://realpython.com/python-command-line-arguments/)
- [CLI 设计最佳实践](https://clig.dev/) — 来自 Google 的 CLI 工具设计指南
