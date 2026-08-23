---
title: RAG 代码实战 Building a RAG System in Code
description: 60 行 Python 搭一个能用的知识库问答系统——切片、嵌入、检索、生成的完整代码走读
last_verified: 2026-08-24
---

> [!abstract] 本课将学到
>
> - G3 讲了 RAG 的概念，这一课用**可运行的纯 Python 代码**实现它
> - 四个组件逐行拆解：文档加载 → 切片嵌入 → 向量检索 → 提示词组装
> - 不依赖任何向量数据库——用字典和余弦相似度理解底层原理
> - 进阶路线：什么时候该引入 ChromaDB / LangChain

## 生活场景切入

G3 用玩具例子演示了原理。今天我们把它变成**真的能用**的系统：给它一批课程笔记，它就能回答关于这些笔记的问题——而且每条回答都标注来源。

全程只用 `openai` 和 `numpy` 两个包，60 行核心代码，零黑箱。

## 架构总览

```text
┌─────────── 离线阶段（跑一次）────────────┐
│  文档 → 切片 → 嵌入 → 存入「向量库」      │
│                 (就是一组 numpy 数组)     │
└──────────────────────────────────────────┘

┌─────────── 在线阶段（每次提问）──────────┐
│  问题 → 嵌入 → 与全部切片算相似度         │
│    → 取 top-k → 拼提示词 → 调 LLM → 回答  │
└──────────────────────────────────────────┘
```

## 组件 1：文档切片 —— 把长文切成语义段

```python
def chunk_text(text, chunk_size=300, overlap=50):
    """按字符数切片，带重叠窗口防止关键句被切断"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        # 尽量在句号处断开（避免句子腰斩）
        if end < len(text):
            last_period = text.rfind("。", start, end)
            if last_period > start:
                end = last_period + 1
        chunks.append(text[start:end])
        start = end - overlap   # 重叠保证上下文连贯
    return chunks

# 示例
doc = "梯度下降是AI训练的核心引擎。" * 20   # 模拟长文档
chunks = chunk_text(doc)
print(f"切成了 {len(chunks)} 片")          # 切成了 3 片
```

**为什么需要重叠**：如果关键信息恰好跨越两个切片的边界，无重叠时两边都只有半句话，检索到哪边都不完整。50 字符的重叠相当于给每个切片留了「上下文尾巴」。

## 组件 2：嵌入 —— 把文字变成向量

用 OpenAI 的 embedding API（也可换本地模型）：

```python
from openai import OpenAI
import numpy as np

client = OpenAI()  # 需要设置 OPENAI_API_KEY 环境变量

def get_embedding(text, model="text-embedding-3-small"):
    response = client.embeddings.create(input=text, model=model)
    return np.array(response.data[0].embedding)   # 返回 1536 维向量

# 对每个切片生成嵌入
embeddings = [get_embedding(c) for c in chunks]
# embeddings 是一个 (n_chunks, 1536) 的矩阵
```

**成本意识**：embedding API 按 token 计费但极便宜（text-embedding-3-small 约 $0.02/百万 token）。离线阶段只跑一次，后续查询只需嵌入用户问题。

## 组件 3：检索 —— 找最相关的 k 个切片

```python
def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def retrieve(query_embedding, doc_embeddings, chunks, top_k=3):
    """返回与查询最相似的 top_k 个切片"""
    scores = [cosine_sim(query_embedding, de) for de in doc_embeddings]
    # 按分数从高到低排序，取前 k 个索引
    top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]
    return [(chunks[i], scores[i]) for i in top_indices]
```

G3 讲过余弦相似度衡量方向合拍度。这里把它用在「问题的向量」和「每个切片的向量」之间——分数越高说明这段话越可能包含答案。

## 组件 4：组装提示词并调用 LLM

```python
def rag_answer(question, chunks, doc_embeddings):
    # ① 嵌入问题
    q_emb = get_embedding(question)

    # ② 检索相关片段
    results = retrieve(q_emb, doc_embeddings, chunks, top_k=3)

    # ③ 组装提示词
    context = "\n---\n".join([r[0] for r in results])
    prompt = f"""根据以下参考材料回答问题。如果材料中没有相关信息，请直接说"根据现有资料无法回答"。

<context>
{context}
</context>

<question>{question}</question>"""

    # ④ 调用 LLM
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,       # 低温度=更忠实于资料
    )
    return response.choices[0].message.content

# 使用
answer = rag_answer("什么是梯度下降？", chunks, embeddings)
print(answer)
```

`temperature=0.1` 的选择逻辑：RAG 场景要的是忠实转述资料而非创意发挥——低温减少模型「自由发挥」的概率。

## 完整流程回顾

```text
你问: "什么是梯度下降？"
     ↓ get_embedding()
问题向量 [0.12, -0.33, ...] (1536维)
     ↓ 余弦相似度 vs 全部切片
排序: 切片2(0.82) > 切片1(0.31) > 切片5(0.15)
     ↓ 取 top-3
拼入 prompt 的 <context> 区域
     ↓ 调用 gpt-4o-mini
回答: "根据资料，梯度下降是AI训练的核心引擎..."
```

## 进阶路线 —— 从玩具到生产

| 层级     | 本课方案           | 生产级替代                   | 升级理由                |
| -------- | ------------------ | ---------------------------- | ----------------------- |
| 向量存储 | Python list + 遍历 | ChromaDB / Pinecone / FAISS  | 百万级数据需要 ANN 加速 |
| 嵌入模型 | OpenAI API         | 本地 sentence-transformers   | 省钱/隐私/离线          |
| 切片策略 | 固定字符数         | 按标题/段落结构切分          | 保持语义完整            |
| 检索策略 | 纯向量             | 混合检索+rerank（G3 概念 4） | 提升召回质量            |
| 框架     | 手写 60 行         | LangChain / LlamaIndex       | 快速迭代+生态集成       |

**学习建议**：先手写一遍本课的 60 行（理解原理），再用框架重写（提升效率）。跳过第一步直接用框架的人，出了 bug 只会搜索 Stack Overflow；走过第一步的人，知道该搜什么。

## 本章英文小词典

| 英文               | 中文       | 一句话记忆             |
| ------------------ | ---------- | ---------------------- |
| Chunking           | 切片       | 长文档切成可检索的小段 |
| Overlap            | 重叠窗口   | 相邻切片共享尾部防截断 |
| Embedding model    | 嵌入模型   | 文字→向量的转换器      |
| Cosine similarity  | 余弦相似度 | 方向匹配度（−1 到 1）  |
| Top-k retrieval    | Top-k 检索 | 取最相关的 k 条        |
| Grounding          | 扎根       | 让 AI 回答有据可依     |
| Vector store       | 向量数据库 | 存嵌入并支持相似度搜索 |
| Ingestion pipeline | 摄取管道   | 离线阶段的自动化处理流 |

## 自测一下

> [!question]- 1. 如果把 `overlap` 设为 0，会发生什么具体问题？
> 关键句被拦腰截断。例：「梯度下降的核心思想是沿负梯度方向更新参数」——如果「沿负梯度」恰好落在切片 1 结尾、「方向更新参数」在切片 2 开头，两个切片各自只有半句。
> 用户问「怎么更新参数」→ 检索到切片 2 但缺上文语境 → LLM 无法准确作答。重叠让边界两侧都有冗余备份，大幅降低这种「信息恰好被切断」的概率。

> [!question]- 2. 为什么检索后用 temperature=0.1 而不是默认的 1.0？
> RAG 的目标是让模型**忠实转述检索到的资料**，而非自由发挥。高温度会增加采样到「不在资料中但统计上流畅」的内容的概率——即幻觉风险上升。
> T=0.1 接近贪心解码但仍保留微小随机性（避免极端确定导致的重复模式）。这与 NLP7 的原则一致：**任务的容错率决定随机性预算**——RAG 场景容错率低所以温度也低。

> [!question]- 3. 当知识库有一百万个切片时，本课的遍历计算余弦相似度的做法会遇到什么瓶颈？如何解决？
> 一百万次 1536 维点积 = 约 1536 亿次浮点运算，单次查询延迟秒级——不可接受。
> 解决：**近似最近邻（ANN）算法**，如 HNSW（分层导航小世界图）或 IVF（倒排文件索引）。它们牺牲少量召回率换取百倍千倍的速度提升。工程上不需要自己实现——ChromaDB、Pinecone、FAISS 都内置了 ANN。
> 元思路：精确解→近似解的切换是规模驱动的经典工程决策，与本站反复出现的「暴力→聪明」演进模式同构。

> [!question]- 4. 你的 RAG 系统对大多数问题表现良好但对「这两个方案有什么区别？」这类比较型问题总是失败。诊断原因并给出修复方案。
> 原因分析：比较型问题需要**同时找到两个方案的资料**才能回答，但向量检索只找「与问题整体最相似」的片段——往往只命中其中一个方案的高分段落，另一个缺席导致 LLM 缺少对比素材。
> 修复方案：
> ① **查询改写**：先用 LLM 把「两个方案的区别」改写为「方案 A 的特点」+「方案 B 的特点」两次独立检索再合并；
> ② **提高 top-k**：从 3 提到 6~8 增大候选池覆盖面；
> ③ **混合检索**：加一路关键词检索确保两个方案的名称都能命中。
> 这类「复合型问题」是 RAG 系统最常见的失败模式之一——识别它需要的不是更多调参而是理解检索机制的局限。

## 下一步

- [[ai/genai/prompt-advanced|进阶提示词工程]]——把 RAG 的提示词部分打磨到极致
- [[ai/genai/agent|G4 Agent]]——当 RAG 不够用时，让 AI 学会自主决定查什么

→ 返回 [[ai/genai/index|✨ GenAI 目录]]
