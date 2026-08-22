# 零基础 AI 学堂 · Zero to AI

面向真·零基础读者（中学知识未完全掌握也能看懂）的中文 AI 学习网站，基于 [Quartz 4](https://quartz.jzhao.xyz) 构建，部署在 Cloudflare Workers（静态资产）。

**所有 AI Agent 必须同时遵守 `D:\Study\rule\AI Agent 行为规范与运行宪章.md`（v2.1）。**

## 常用命令

```bash
npm install              # 安装依赖
npx quartz build         # 构建（输出到 public/）
npx quartz build --serve # 本地预览 http://localhost:8080
npx tsc --noEmit         # 类型检查
```

## 多 Agent 协作规范

本仓库由 5 个并行 Agent 共同维护，角色与前缀见宪章第四十五章：

| 角色              | 分支命名空间   | 负责目录                                                                 | 任务前缀 |
| ----------------- | -------------- | ------------------------------------------------------------------------ | -------- |
| 数学 Writer       | `ai/math/*`    | `content/prerequisites/math/`                                            | MATH     |
| 英语 Writer       | `ai/english/*` | `content/prerequisites/english/`                                         | ENG      |
| AI 课程 Writer    | `ai/aic/*`     | `content/ml/ dl/ nlp/ genai/ rl/ getting-started/ prerequisites/python/` | AIC      |
| 青年大学习 Writer | `ai/qnx/*`     | `content/qingnian/`                                                      | QNX      |
| 审查 Reviewer     | `ai/review/*`  | 只写 `logs/`，不改内容                                                   | REV      |

**流程铁律**（宪章第四、八、四十一章）：

1. 禁止直推 `main`；每个任务从最新 main 切分支 `ai/<role>/<TASK-ID>`
2. Commit 格式：`feat(math): 新增 M6 导数课程` + 正文注明 `Task: TASK-ID`
3. 共享文件（`roadmap.md` / `index.md` / `glossary.md`）只在自己的分支上改，合并串行处理
4. Reviewer 在全新会话中审查，产出报告到 `logs/`，Writer 不得自审
5. 会话结束时向 `logs/agent-log.md` 追加行为日志（模板在该文件头部）
6. 内容分级：L1 一般知识 / L2 时事政策（青年大学习属此类）/ L3 高风险——L2 严禁猜答案，无法确认标「⚠️ 待验证」

## 写作规范（给协作者与 AI 助手）

**新增一课的流程**：

1. 在对应板块目录下新建 `英文slug.md`（如 `linear-regression.md`）
2. frontmatter：`title` 用「中文名（English Term）」格式，`description` 一句话概括，加 `last_verified: YYYY-MM-DD`
3. 按模板写作（完整模板见站内 [[guide|使用指南]]）：

```
> [!abstract] 本课将学到  →  ## 生活场景切入  →  ## 核心概念
→  ## 数学在哪里？（需要时）  →  ## 交互演示（可选）
→  ## 本章英文小词典  →  ## 自测一下（≥3 题，[!question]- 折叠答案）  →  ## 下一步
```

**硬性约定**：

- **零基础假设**：默认读者没学过高中数学；超出小学的概念必须先解释，公式前后都要有「人话」
- **术语标注**：首次出现写 `**中文（English）**`，之后可只用中文；同步更新 `content/appendix/glossary.md`
- **双链**：相关课程互相 `[[链接]]`；新课后更新所在板块的 `index.md` 和 `content/roadmap.md` 的状态表
- **交互 widget**：原生 HTML/JS 单文件放 `quartz/static/widgets/`，正文用 `<iframe src="/static/widgets/xxx.html" class="widget-frame" style="height:XXXpx"></iframe>` 嵌入；widget 内用 CSS 变量 `--bg/--canvas-bg/--border/--text/--text-sub/--cat/--dog/--line` 并支持 `html.dark` 类与 postMessage `{type:"theme", theme}` 消息同步暗色模式
- **状态标记**：🚧 施工中 / ✅ 已完成，写在各 index.md 与 roadmap.md 的表格里

## 青年大学习板块规范（L2 级内容）

目录：`content/qingnian/`，按学期组织（如 `2026-s2/lesson-01.md`）。

每期模板：

```markdown
---
title: 青年大学习 2026年春季第N期
description: 本期主题一句话
last_verified: YYYY-MM-DD
source: 官方平台名称 + 期数链接
---

## 本期主题

……背景与要点整理

## 题目与答案

> [!question]- 第 1 题：题干？
> **答案：X**
> 解析 + 出处（哪一段/哪个文件）

## ⚠️ 待验证

（无法确认答案的题目，说明原因）
```

**铁律**：答案必须标注来源；不确定的题不得编造，放入「待验证」区。

## 目录结构

```
content/
├── getting-started/   入门（第 1 章 what-is-ai.md）
├── prerequisites/     数学 math / Python python / 英语 english
├── ml/ dl/ nlp/ genai/ rl/   五大主题板块
├── qingnian/          青年大学习（按学期分文件夹）
└── appendix/          glossary 术语表 / formulas 公式卡 / resources 资源
logs/
└── agent-log.md       Agent 行为日志（宪章第四十七章）
quartz/
├── components/TTSReader.tsx        🔊 听读组件（speechSynthesis）
├── static/widgets/*.html           交互演示 widget
quartz.config.ts    站点配置（baseUrl = www.eutopia.wiki）
quartz.layout.ts    布局（footer 链接、TTSReader 注册处）
wrangler.jsonc      Cloudflare Workers 部署配置
```

## 部署

Cloudflare Workers 静态资产：GitHub push → 自动构建 → 构建命令 `npm run deploy`（= `quartz build` + `wrangler deploy`），配置在 `wrangler.jsonc`。线上地址 https://www.eutopia.wiki （Worker 路由需为 `www.eutopia.wiki/*`）。
