"""tools/web_fetch.py — WebFetchTool"""

import httpx
from tools.base import BaseTool


class WebFetchTool(BaseTool[str, str]):
    """获取网页内容"""

    @property
    def name(self) -> str:
        return "web_fetch"

    @property
    def description(self) -> str:
        return "获取 URL 的网页内容，返回文本（截取前 2000 字符）"

    async def execute(self, url: str) -> str:
        if not url.startswith(("http://", "https://")):
            return f"错误: 无效的 URL: {url}"

        headers = {"User-Agent": "Mozilla/5.0 (compatible; ClaudeCodeBot/1.0)"}
        async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
            response = await client.get(url)
            response.raise_for_status()

        content = response.text
        if len(content) > 2000:
            return content[:2000] + f"\n\n[内容已截断，原长度 {len(content)} 字符]"
        return content
