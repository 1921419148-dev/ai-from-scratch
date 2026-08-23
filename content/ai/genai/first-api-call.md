---
title: 第一次调用大模型 API Your First LLM API Call
description: 用 20 行 Python 调通你的第一个大模型——消息结构、流式输出、异常处理与成本意识，从「聊天框用户」升级为「API 开发者」
last_verified: 2026-08-24
---

> [!abstract] 本课将学到
>
> - **API（Application Programming Interface）**：程序怎么跟大模型对话
> - 消息结构 `messages` 的完整语法：system / user / assistant 三种角色
> - 流式输出（streaming）与非流式的取舍
> - 异常处理四件套——生产代码的底线
> - Token 计费意识：写代码前先算成本

## 生活场景切入

你每天都在用 ChatGPT 的对话框，但对话框只是冰山露出水面的部分。水面之下是 **API**——让程序调程序的标准接口。

```text
你在浏览器打字     = 面向人的交互
你的代码调 API    = 面向程序的交互

两者最终都到达同一个地方：模型推理引擎
区别只在于：API 让你把 AI 嵌进自己的产品/脚本/工作流里
```

学会了调 API，「用 AI」就变成了「用 AI 编程」——自动批量摘要、智能客服、文档问答……所有 GenAI 应用的第一步都在这里。

## 概念 1：准备 —— 拿到钥匙

调用任何大模型 API 都需要两样东西：

```text
① API Key：一串字符，证明「你是谁」（相当于账号密码合体）
② Base URL：服务器的地址

以 OpenAI 兼容接口为例（业界事实标准，几乎所有模型服务商都兼容此格式）：
```

```bash
pip install openai        # SDK 包名统一为 openai（v2.x）
```

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",                    # 你的密钥
    base_url="https://api.example.com/v1" # 服务商地址（OpenAI 官方可省略）
)
```

> [!warning] 密钥安全三铁律
> ① **永远不要把 Key 写进代码提交到 Git**（用环境变量 `os.environ["OPENAI_API_KEY"]`）
> ② **不要在聊天中粘贴完整 Key 给任何人**（包括 AI 助手）
> ③ **泄露后立刻在后台作废重生成**——不是改代码，是先废 Key

## 概念 2：第一次调用 —— messages 是一切的核心

```python
response = client.chat.completions.create(
    model="gpt-4o-mini",       # 模型名（各服务商不同）
    messages=[                  # ← 对话历史，核心中的核心
        {"role": "user", "content": "什么是机器学习？"}
    ]
)

print(response.choices[0].message.content)
# 输出：机器学习是人工智能的一个分支，它让计算机从数据中...
```

**messages 数组**就是模型的全部世界。三种角色各有分工：

| 角色        | 含义                         | 类比           |
| ----------- | ---------------------------- | -------------- |
| `system`    | 设定身份与规则（用户看不到） | 岗位职责说明书 |
| `user`      | 用户说的话                   | 你打的字       |
| `assistant` | 模型之前的回复               | 对话记录       |

多轮对话就是把历史全塞进去：

```python
messages = [
    {"role": "system", "content": "你是一位耐心的编程老师"},
    {"role": "user", "content": "Python 的 list 和 tuple 有什么区别？"},
    {"role": "assistant", "content": "list 可变，tuple 不可变..."},   # ← 上一轮回复
    {"role": "user", "content": "那我什么时候该用 tuple？"},          # ← 本轮问题
]
```

G2 学过：**模型没有记忆，它只看 messages 里有什么**。所谓「记住上文」，本质是你每次都把完整历史重新发送。

## 概念 3：流式输出 —— 打字机效果的实现

默认模式等全部生成完一次性返回；加一个参数变成逐 token 推送：

```python
# 非流式：等全部完成（适合后端处理）
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
)

# 流式：逐 token 接收（适合前端展示）
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
    stream=True,              # ← 就这一个参数的区别
)

for chunk in stream:
    content = chunk.choices[0].delta.content
    if content:               # 最后一个 chunk 可能没有 content
        print(content, end="", flush=True)
```

| 场景                 | 选哪个 | 理由                             |
| -------------------- | ------ | -------------------------------- |
| 后端批处理/管道      | 非流式 | 不需要逐字展示，一次拿到更好处理 |
| 聊天界面/实时反馈    | 流式   | 用户看到打字机效果，体验感倍增   |
| 需要统计完整回复长度 | 非流式 | 流式需要手动拼接才能计数         |

## 概念 4：异常处理 —— 生产代码的底线

网络会断、Key 会过期、余额会用完、模型会限流。**不处理异常的 API 调用等于定时炸弹**：

```python
import openai

def safe_chat(messages, model="gpt-4o-mini"):
    try:
        response = client.chat.completions.create(
            model=model, messages=messages
        )
        return response.choices[0].message.content
    except openai.AuthenticationError:
        return "错误：API Key 无效或过期"
    except openai.RateLimitError:
        return "错误：触发限流，请稍后重试或检查余额"
    except openai.APIConnectionError:
        return "错误：无法连接到服务器"
    except openai.APIStatusError as e:
        return f"服务端错误 {e.status_code}：{e.message}"

result = safe_chat([{"role": "user", "content": "你好"}])
print(result)
```

四种异常覆盖了 90% 的线上故障。**每个 try-except 分支都是一种故障的诊断结果**——这和 DL12 的诊断流程图是同一思想：错误信息越具体，修复越快。

### 重试策略

限流（RateLimitError）通常等几秒就能恢复，值得自动重试：

```python
import time

def chat_with_retry(messages, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model="gpt-4o-mini", messages=messages
            )
        except openai.RateLimitError:
            if attempt < max_retries - 1:
                wait = 2 ** attempt          # 1s, 2s, 4s 指数退避
                print(f"限流，{wait}s 后重试...")
                time.sleep(wait)
            else:
                raise                         # 重试耗尽，向上抛出
```

指数退避（1→2→4→8 秒）是所有 API 交互的标配——比固定间隔更尊重服务器压力。

## 概念 5：Token 经济学 —— 写代码前先算账

G2 教过输入便宜输出贵。现在把它变成预算公式：

```text
单次调用成本 ≈ (输入 tokens × 单价_in) + (输出 tokens × 单价_out)

例（假设 gpt-4o-mini 定价 $0.15/M in, $0.60/M out）：
  输入 500 token + 输出 200 token
  = 500×0.00000015 + 200×0.0000006
  = $0.000075 + $0.00012 = $0.000195/次

如果每天跑 10000 次 → 每天 ≈ $1.95 → 每月 ≈ $58.5
```

三个省钱杠杆（按效果排序）：

```text
① 换小模型：简单任务用 mini 版而非旗舰版（差价 10~50 倍）
② 缩短输出：max_tokens 设上限 + 提示词要求精简
③ 缓存复用：相同前缀的系统提示词部分由 KV cache 加速（部分服务商有缓存折扣）
```

**工程纪律**：任何 API 项目上线前必须跑一遍成本预估——用真实数据量乘以单价。ML9 评估思维的成本版。

## 本章英文小词典

| 英文                | 中文     | 一句话记忆                |
| ------------------- | -------- | ------------------------- |
| API Key             | API 密钥 | 你的身份凭证，泄露即废    |
| Base URL            | 基础地址 | API 服务器的根路径        |
| Messages array      | 消息数组 | 对话历史的结构化表示      |
| System prompt       | 系统提示 | 设定角色与规则的隐藏指令  |
| Streaming           | 流式输出 | 逐 token 推送的打字机模式 |
| Rate limit          | 速率限制 | 每分钟最多几次请求        |
| Exponential backoff | 指数退避 | 1s→2s→4s 的礼貌重试       |
| max_tokens          | 最大词元 | 输出长度的硬上限          |

## 自测一下

> [!question]- 1. 为什么多轮对话要每次发全部历史而不是只发新消息？从 G2 的机制角度回答。
> 因为语言模型是**无状态**的：它没有内置记忆模块，每次调用只看当前收到的 messages 数组。不发历史 = 模型不知道之前聊了什么。
> 这也是为什么上下文越长费用越高（每轮重复计费全部历史），以及 G2 说的「聊得久就失忆」——超出窗口的历史被截断了。
> 工程优化方向：历史压缩总结、RAG 外部记忆、滑动窗口截断——都是在这条机制约束下做的设计妥协。

> [!question]- 2. system 消息和 user 消息里的指令有什么不同？什么时候该放 system？
> system 消息在模型训练时被赋予了更高的遵循优先级（类似「老板说的」vs「客户说的」）；且它在界面上对用户不可见，适合放不需要暴露的设定。
> 该放 system 的内容：角色设定（你是谁）、输出格式约束（永远 JSON）、安全边界（不许做什么）。
> 该放 user 的内容：具体的任务输入（这次的问题/文本）。经验法则：**不变的规则放 system，变化的内容放 user**。

> [!question]- 3. 为什么推荐用环境变量而不是直接在代码里写死 API Key？
> 核心风险是 **Git 泄露**：一旦 Key 出现在 commit 里，即使后续删除也留在 Git 历史中，且如果仓库公开则立刻被自动化爬虫抓取滥用（GitHub 上有专门的 Key 扫描机器人，几分钟内就能盗刷）。
> 环境变量的好处：代码仓库不含敏感信息、不同环境（开发/生产）可用不同 Key、更换 Key 不需要改代码。`.gitignore` 加上 `.env` 文件是最基本的防线。

> [!question]- 4. 设计一个「每天自动摘要 RSS 新闻」的脚本架构。列出组件、成本控制点和异常处理策略。
> 组件：① RSS 抓取器（feedparser 库）→ ② 去重过滤（对比已处理列表）→ ③ 批量摘要（每篇调一次 API）→ ④ 汇总输出（写入文件或推送通知）。
> 成本控制：用 mini 级模型（摘要不需要旗舰能力）；限制每日处理条数上限；系统提示词精简复用；输出限制在 100 token 内。
> 异常处理：RSS 拉取失败→跳过本轮下次再试；API 限流→指数退避重试（概念 4）；单条摘要失败→跳过不影响其他条目；全部失败→发告警通知。
> 元思路：这个架构包含了 RAG 的雏形（外部数据注入）+ Agent 的调度思想（多步骤流水线）——学完本课后面的课程会发现这些概念层层嵌套。

## 下一步

- [[ai/genai/rag-code|下一篇 · RAG 代码实战]]——给 API 调用加上检索增强的超能力
- 相关：[[ai/genai/language-model-principles|G2 语言模型原理]] · [[english/cet/listening|C2 听力三源诊断]]（同款「先诊断再治疗」思路）

→ 返回 [[ai/genai/index|✨ GenAI 目录]]
