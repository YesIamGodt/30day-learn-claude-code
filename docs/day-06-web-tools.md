# Day 6: 搜索工具 — WebSearch + WebFetch

## 目标

今天我们将实现两个让 Claude Code 能"上网"的工具：WebSearchTool（网络搜索）和 WebFetchTool（获取网页内容）。有了这两个工具，AI 就能获取最新信息，不再局限于训练数据。

学完今天后，你将能：
- 使用 `httpx` 异步发送 HTTP GET 请求
- 解析 JSON API 响应和 HTML 网页内容
- 实现 URL 验证和超时控制
- 理解 API Key 的使用（搜索 API 需要 Key）

## 预习

- [httpx 官方文档](https://www.python-httpx.org/) — 异步 HTTP 客户端
- [DuckDuckGo API](https://duckduckgo.com/) — 无需 API Key 的搜索服务
- [RSS Feed 解析](https://docs.python.org/3/library/xml.etree.elementtree.html) — 另一种获取信息的方式

## 骨架代码

```python
"""tools/web_search.py — WebSearchTool"""

import httpx
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
        """执行搜索"""
        # TODO: 使用 httpx.AsyncClient() 异步请求
        # 使用 DuckDuckGo HTML 搜索: https://html.duckduckgo.com/html/?q={query}
        # 返回格式: [{"title": "...", "url": "...", "snippet": "..."}]
        # 参考: BeautifulSoup 或正则表达式解析 HTML
        # timeout=10 秒
        raise NotImplementedError("execute 需要你实现 httpx + HTML 解析")


class WebFetchTool(BaseTool[str, str]):
    """获取网页内容"""

    @property
    def name(self) -> str:
        return "web_fetch"

    @property
    def description(self) -> str:
        return "获取 URL 的网页内容，返回文本（截取前 2000 字符）"

    async def execute(self, url: str) -> str:
        """获取网页"""
        # TODO: 验证 URL 格式（必须以 http:// 或 https:// 开头）
        # 使用 httpx.AsyncClient().get(url, timeout=10)
        # User-Agent 设置为浏览器，避免被反爬
        # 返回 content[:2000]，超出部分截断并注明
        raise NotImplementedError("execute 需要你实现 httpx GET 请求")
```

```python
"""main.py — Day 6: 搜索工具演示"""

import asyncio
from tools.registry import get_registry
from tools.web_search import WebSearchTool, WebFetchTool


async def main():
    registry = get_registry()
    registry.clear()

    registry.register(WebSearchTool())
    registry.register(WebFetchTool())

    print("已注册工具:", [t.name for t in registry.list_tools()])
    print()

    # 演示 WebSearchTool
    search = registry.get("web_search")
    results = await search.execute("Python asyncio tutorial", limit=3)
    print("搜索结果:")
    for r in results:
        print(f"  - {r.get('title', 'N/A')}")
        print(f"    {r.get('url', 'N/A')}")
    print()

    # 演示 WebFetchTool
    if results:
        first_url = results[0].get("url", "")
        if first_url.startswith("http"):
            fetch = registry.get("web_fetch")
            content = await fetch.execute(first_url)
            print(f"网页内容（前200字符）:\n{content[:200]}...")


if __name__ == "__main__":
    asyncio.run(main())
```

## 作业（填空题）

### 题目 1：实现 WebSearchTool

使用 `httpx` 和正则表达式实现搜索：

```python
import httpx
import re

async def execute(self, query: str, limit: int = 5) -> list[dict]:
    url = f"https://html.duckduckgo.com/html/?q={httpx.URL(query).params}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        response.raise_for_status()

    # 用正则解析 HTML 中的搜索结果
    results = []
    pattern = re.compile(r'<a class="result__a" href="([^"]+)">([^<]+)</a>')
    for match in pattern.finditer(response.text):
        url, title = match.group(1), match.group(2)
        results.append({"title": title, "url": url, "snippet": ""})
        if len(results) >= limit:
            break
    return results
```

### 题目 2：实现 WebFetchTool

```python
import httpx

async def execute(self, url: str) -> str:
    if not url.startswith(("http://", "https://")):
        return f"错误: 无效的 URL（必须以 http:// 或 https:// 开头）: {url}"

    headers = {"User-Agent": "Mozilla/5.0 (compatible; ClaudeCodeBot/1.0)"}
    async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
        response = await client.get(url)
        response.raise_for_status()

    content = response.text
    if len(content) > 2000:
        return content[:2000] + f"\n\n[内容已截断，原长度 {len(content)} 字符]"
    return content
```

## 答案解析

<details>
<summary>点击展开 Day 6 完整答案</summary>

### tools/web_search.py

```python
"""tools/web_search.py — WebSearchTool"""

import httpx
import re
from tools.base import BaseTool


class WebSearchTool(BaseTool[str, list[dict]]):
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
```

### 关键点

1. **httpx.AsyncClient**: 异步 HTTP 客户端，类似 requests 但支持 async/await
2. **DuckDuckGo HTML 搜索**: 无需 API Key，但解析相对粗糙
3. **User-Agent**: 模拟浏览器，避免被网站反爬

</details>

## 延伸阅读

- [httpx 异步文档](https://www.python-httpx.org/async/)
- [DuckDuckGo HTML 搜索](https://duckduckgo.com/html/)
- [安全爬虫指南](https://www scraped.com/ethics) — 爬虫伦理
