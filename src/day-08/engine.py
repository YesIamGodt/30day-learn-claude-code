"""engine.py — 工具调用循环引擎"""

from typing import Optional
from anthropic import Anthropic
from history import ConversationHistory
from tools.registry import get_registry


class ToolCall:
    def __init__(self, id: str, name: str, input_data):
        self.id = id
        self.name = name
        self.input = input_data


class ToolResult:
    def __init__(self, tool_call_id: str, output: str, is_error: bool = False):
        self.tool_call_id = tool_call_id
        self.output = output
        self.is_error = is_error


class QueryEngine:
    def __init__(self, client: Anthropic, history: ConversationHistory, max_turns: int = 30, max_tokens: int = 4096):
        self.client = client
        self.history = history
        self.max_turns = max_turns
        self.max_tokens = max_tokens

    async def run(self, prompt: str) -> str:
        for turn in range(self.max_turns):
            response, tool_calls = await self.step(prompt)
            prompt = ""

            if not tool_calls:
                return response.content[0].text if response.content else ""

            for tc in tool_calls:
                result = await self.execute_tool(tc)
                self.history.add_message(
                    "user",
                    f"[TOOL_CALL id=\"{tc.id}\"] {tc.name} result: {result.output}"
                )

        return "错误: 达到最大循环次数（无限循环检测）"

    async def step(self, prompt: str) -> tuple:
        if prompt:
            self.history.add_message("user", prompt)

        tools = [t.to_schema() for t in get_registry().list_tools()]

        response = self.client.messages.create(
            model="claude-opus-4-5",
            max_tokens=self.max_tokens,
            messages=self.history.get_messages(),
            tools=tools if tools else None,
        )

        text = ""
        if response.content and hasattr(response.content[0], 'text'):
            text = response.content[0].text
        if text:
            self.history.add_message("assistant", text)

        return response, response.tool_calls or []

    async def execute_tool(self, tool_call: ToolCall) -> ToolResult:
        registry = get_registry()
        tool = registry.get(tool_call.name)
        try:
            result = await tool.execute(tool_call.input)
            return ToolResult(tool_call_id=tool_call.id, output=str(result))
        except Exception as e:
            return ToolResult(tool_call_id=tool_call.id, output=f"错误: {e}", is_error=True)
