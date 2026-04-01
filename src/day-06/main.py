"""main.py — Day 6: 搜索工具演示"""

import asyncio
from tools.registry import get_registry
from tools.web_search import WebSearchTool
from tools.web_fetch import WebFetchTool


async def main():
    registry = get_registry()
    registry.clear()

    registry.register(WebSearchTool())
    registry.register(WebFetchTool())

    print("已注册工具:", [t.name for t in registry.list_tools()])
    print()

    search = registry.get("web_search")
    results = await search.execute("Python asyncio tutorial", limit=3)
    print("搜索结果:")
    for r in results:
        print(f"  - {r.get('title', 'N/A')}")
        print(f"    {r.get('url', 'N/A')}")
    print()

    if results:
        first_url = results[0].get("url", "")
        if first_url.startswith("http"):
            fetch = registry.get("web_fetch")
            content = await fetch.execute(first_url)
            print(f"网页内容（前200字符）:\n{content[:200]}...")


if __name__ == "__main__":
    asyncio.run(main())
