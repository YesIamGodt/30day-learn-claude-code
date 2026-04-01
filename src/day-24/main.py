"""main.py"""
import asyncio
from mcp_client import MCPClient

async def main():
    client = MCPClient("http://localhost:8080/mcp")
    try:
        tools = await client.list_tools()
        print(f"可用工具: {tools}")
    except Exception as e:
        print(f"MCP 服务器未运行: {e}")
        print("（这是正常的——Day 24 学习 MCP 协议本身，不需要真实服务器）")

if __name__ == "__main__":
    asyncio.run(main())
