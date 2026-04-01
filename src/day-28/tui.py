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
