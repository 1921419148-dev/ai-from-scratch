# 零基础 AI 学堂 · Zero to AI

面向真·零基础读者（中学知识未完全掌握也能看懂）的 AI 中文教程网站，基于 [Quartz 4](https://quartz.jzhao.xyz) 构建，部署在 Cloudflare Pages。

## 常用命令

```bash
npm install              # 安装依赖
npx quartz build         # 构建（输出到 public/）
npx quartz build --serve # 本地预览 http://localhost:8080
npx tsc --noEmit         # 类型检查
```

## 写作规范（给协作者与 AI 助手）

**新增一课的流程**：

1. 在对应板块目录下新建 `英文slug.md`（如 `linear-regression.md`）
2. frontmatter：`title` 用「中文名（English Term）」格式，`description` 一句话概括
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

## 目录结构

```
content/
├── getting-started/   入门（第 1 章 what-is-ai.md）
├── prerequisites/     数学 math / Python python / 英语 english
├── ml/ dl/ nlp/ genai/ rl/   五大主题板块
└── appendix/          glossary 术语表 / formulas 公式卡 / resources 资源
quartz/
├── components/TTSReader.tsx        🔊 听读组件（speechSynthesis）
├── static/widgets/*.html           交互演示 widget
quartz.config.ts    站点配置（baseUrl 部署后需回填真实域名）
quartz.layout.ts    布局（footer 链接、TTSReader 注册处）
```

## 部署

Cloudflare Pages：连接 GitHub 仓库，构建命令 `npx quartz build`，输出目录 `public`，生产分支 `main`，环境变量 `NODE_VERSION=22`。
