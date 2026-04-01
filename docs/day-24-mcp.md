# Day 24: MCP 协议 — Model Context Protocol 简化实现

## 目标

MCP（Model Context Protocol）是一个标准化协议，让 AI 能与外部工具和服务交互。我们来实现一个简化版的 MCP 客户端。

## 骨架代码

```python
"""mcp_client.py"""
import json
import asyncio
from dataclasses import dataclass
from typing import Any

@dataclass
class MCPMessage:
    jsonrpc: str = "2.0"
    id: str | None = None
    method: str | None = None
    params: dict | None = None
    result: Any = None
    error: dict | None = None

class MCPClient:
    def __init__(self, server_url: str):
        self.server_url = server_url

    async def call_tool(self, tool_name: str, params: dict) -> dict:
        # TODO: 发送 JSON-RPC 2.0 请求到 MCP 服务器
        # 格式: {"jsonrpc": "2.0", "method": "tools/call", "params": {...}, "id": "1"}
        raise NotImplementedError

    async def list_tools(self) -> list[dict]:
        # TODO: 调用 tools/list 方法
        raise NotImplementedError
```

## 答案解析

<details>
<summary>点击展开 Day 24 答案</summary>

```python
"""mcp_client.py"""
import json
import asyncio
import httpx
from dataclasses import dataclass
from typing import Any

@dataclass
class MCPMessage:
    jsonrpc: str = "2.0"
    id: str | None = None
    method: str | None = None
    params: dict | None = None
    result: Any = None
    error: dict | None = None

class MCPClient:
    def __init__(self, server_url: str):
        self.server_url = server_url

    async def _send(self, method: str, params: dict | None = None, id: str = "1") -> dict:
        payload = {"jsonrpc": "2.0", "method": method, "id": id}
        if params:
            payload["params"] = params
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.server_url, json=payload)
            return response.json()

    async def call_tool(self, tool_name: str, params: dict) -> dict:
        return await self._send("tools/call", {"name": tool_name, "params": params})

    async def list_tools(self) -> list[dict]:
        result = await self._send("tools/list")
        return result.get("result", {}).get("tools", [])
```

</details>

## 延伸阅读
- [Model Context Protocol](https://modelcontextprotocol.io/)
