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
