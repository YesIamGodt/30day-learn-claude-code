"""tools/web_search.py — WebSearchTool"""

import httpx
import re
from tools.base import BaseTool


class WebSearchTool(BaseTool[str, list[dict]]):
    """网络搜索，返回搜索结果列表"""

    @property
    def name(self) -> str:
        return "web_search"

    @property
    def description(self) -> str:
        return "搜索网络，返回标题+URL+摘要的列表"

    async def execute(self, query: str, limit: int = 5) -> list[dict]:
        encoded = httpx.URL(query).params
        url = f"https://html.duckduckgo.com/html/?q={encoded}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response.raise_for_status()

        results = []
        pattern = re.compile(r'<a class="result__a" href="([^"]+)">([^<]+)</a>')
        for match in pattern.finditer(response.text):
            results.append({
                "title": match.group(2),
                "url": match.group(1),
                "snippet": "",
            })
            if len(results) >= limit:
                break
        return results
