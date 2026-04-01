# 30 天学习路径汇总

## 阶段一：基础建设（Day 1-15）

| 天数 | 标题 | 一句话描述 |
|------|------|---------|
| Day 1 | Python CLI 基础 | 用 argparse 构建命令行程序 |
| Day 2 | 异步编程基础 | asyncio 事件循环与并发执行 |
| Day 3 | Anthropic API 调用 | 用 SDK 发送消息获取 AI 回复 |
| Day 4 | Tool 系统设计 | 抽象基类 + 注册表模式 |
| Day 5 | 第一个工具 | BashTool + FileReadTool + FileWriteTool |
| Day 6 | 搜索工具 | WebSearchTool + WebFetchTool |
| Day 7 | 对话历史管理 | tiktoken Token 计数与历史截断 |
| Day 8 | 工具调用循环 | ReAct 模式：AI → 工具 → 结果 → AI |
| Day 9 | Token 计数与成本 | 按模型定价计算 API 调用成本 |
| Day 10 | REPL 主循环 | while True 交互循环 |
| Day 11 | 权限系统 | 危险命令检测 + 用户审批 |
| Day 12 | 上下文管理 | 动态注入 git 状态、工作目录等上下文 |
| Day 13 | 错误处理与重试 | 指数退避重试装饰器 |
| Day 14 | 配置管理 | YAML 配置文件 + Pydantic 验证 |
| Day 15 | **里程碑一** | 最小可用 CLI（整合前 14 天代码）|

## 阶段二：核心功能（Day 16-20）

| 天数 | 标题 | 一句话描述 |
|------|------|---------|
| Day 16 | 命令系统 | /help / /config / /model 等 slash 命令 |
| Day 17 | 任务系统 | TaskCreate / TaskUpdate / TaskList |
| Day 18 | 计划模式 | EnterPlan / ExitPlan，先计划后执行 |
| Day 19 | 上下文压缩 | 历史太长时用 AI 摘要压缩 |
| Day 20 | **里程碑二** | 完整工具调用循环 |

## 阶段三：高级功能（Day 21-27）

| 天数 | 标题 | 一句话描述 |
|------|------|---------|
| Day 21 | Skill 系统 | 可复用工作流定义和执行器 |
| Day 22 | 记忆系统 | 持久化记忆文件（JSON）|
| Day 23 | 子 Agent | AgentTeam 并行多 Agent 协作 |
| Day 24 | MCP 协议 | JSON-RPC 2.0 MCP 客户端 |
| Day 25 | 配置迁移 | 多版本配置平滑升级 |
| Day 26 | Feature Flag | 灰度发布和 A/B 测试 |
| Day 27 | 插件系统 | 动态加载 Python 插件 |

## 阶段四：收尾（Day 28-30）

| 天数 | 标题 | 一句话描述 |
|------|------|---------|
| Day 28 | Textual TUI | 富交互终端 UI 界面 |
| Day 29 | 测试与 CI | pytest 测试 + GitHub Actions |
| Day 30 | **最终里程碑** | 完整 Claude Code 诞生 |
