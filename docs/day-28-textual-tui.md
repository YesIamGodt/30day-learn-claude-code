# Day 28: Textual TUI 增强 — 打造专业级终端界面

## 目标

今天我们将使用 Textual 库为 Claude Code 添加富交互式终端 UI（Textual User Interface）。Textual 类似 React，但用于终端——支持组件、状态管理、动画和键盘事件。

## 预习

- [Textual 官方文档](https://textual.textualize.io/) — Python TUI 框架
- [Textual Widgets](https://textual.textualize.io/widgets/) — 各种 UI 组件

## 骨架代码

```python
"""tui.py — Textual TUI 界面"""
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Log, Input
from textual.containers import Container

class ClaudeTUI(App):
    CSS = """
    Screen {
        background: #1e1e2e;
    }
    Log {
        height: 1fr;
        border: solid green;
    }
    Input {
        dock: bottom;
        height: 3;
    }
    """

    def compose(self) -> ComposeResult:
        yield Header()
        yield Container(Log(id="log"))
        yield Footer()
        yield Input(placeholder="输入消息，按 Enter 发送...", id="input")

    def on_mount(self):
        log = self.query_one("#log", Log)
        log.write_line("Claude Code TUI 启动！")
        log.write_line("=" * 40)

    def on_input_submitted(self, event: Input.Submitted):
        log = self.query_one("#log", Log)
        log.write_line(f"你: {event.value}")
        log.write_line(f"Claude: [模拟回复] {event.value}")
        self.query_one("#input", Input).value = ""
```

## 作业

### 题目 1：添加颜色支持
在 Log 中为不同类型的消息添加不同颜色。

### 题目 2：添加键盘快捷键
Ctrl+C 退出，Ctrl+L 清屏。

## 答案解析

<details>
<summary>点击展开 Day 28 答案</summary>

```python
"""tui.py — Textual TUI 界面"""
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Log, Input
from textual.containers import Container
from textual.binding import Binding

class ClaudeTUI(App):
    CSS = """
    Screen { background: #1e1e2e; }
    Log { height: 1fr; border: solid green; }
    Input { dock: bottom; height: 3; }
    """

    BINDINGS = [
        Binding("ctrl+c", "quit", "退出", show=True),
        Binding("ctrl+l", "clear", "清屏", show=True),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        yield Container(Log(id="log"))
        yield Footer()
        yield Input(placeholder="输入消息，按 Enter 发送...", id="input")

    def on_mount(self):
        log = self.query_one("#log", Log)
        log.write_line("Claude Code TUI 启动！")
        log.write_line("=" * 40)

    def on_input_submitted(self, event: Input.Submitted):
        log = self.query_one("#log", Log)
        log.write_line(f"[bold cyan]你:[/bold cyan] {event.value}")
        log.write_line(f"[bold green]Claude:[/bold green] [模拟回复] {event.value}")
        self.query_one("#input", Input).value = ""

    def action_clear(self):
        self.query_one("#log", Log).clear()
```

</details>

## 延伸阅读
- [Textual 官方教程](https://textual.textualize.io/tutorial/)
