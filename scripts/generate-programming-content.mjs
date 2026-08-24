import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const verified = "2026-08-25"
const root = path.resolve("content/programming")

const sql = [
  [
    "select",
    "SQL1 · SELECT：从表格中取出数据",
    "sql-select",
    "数据库像一组有规则的电子表格，SELECT 负责回答“我想看哪些列”。",
    "SELECT 列名 FROM 表名",
    "把默认查询改成只显示 name，并观察列头变化。",
    "SELECT * FROM students 会返回全部列；学习阶段更推荐明确写出需要的列。",
  ],
  [
    "filter",
    "SQL2 · WHERE：只留下符合条件的行",
    "sql-filter",
    "WHERE 像筛子：每一行都接受一次条件检查，结果为真才留下。",
    "比较运算、AND、OR 与 ORDER BY",
    "筛出北京且分数不少于 80 的学生。",
    "文字值需要引号；数字通常不需要。",
  ],
  [
    "aggregate",
    "SQL3 · 聚合与分组",
    "sql-aggregate",
    "聚合函数把许多行压缩成一个答案，GROUP BY 则先分组再分别计算。",
    "COUNT、SUM、AVG、MIN、MAX、GROUP BY",
    "统计每个城市的人数与平均分。",
    "SELECT 中的普通列通常必须出现在 GROUP BY 中。",
  ],
  [
    "join",
    "SQL4 · JOIN：把多张表拼起来",
    "sql-join",
    "关系数据库会把不同对象分表保存，JOIN 通过共同编号恢复它们之间的联系。",
    "主键、外键与 INNER JOIN",
    "列出每位学生报名的课程名称。",
    "多张表有同名列时要写 students.id 这样的完整名字。",
  ],
  [
    "write",
    "SQL5 · INSERT、UPDATE 与 DELETE",
    "sql-write",
    "查询负责读，写入语句负责改变数据。先用 WHERE 确认范围，再执行修改。",
    "INSERT、UPDATE、DELETE 与事务意识",
    "添加一位学生，再把其分数提高 2 分并查询确认。",
    "没有 WHERE 的 UPDATE 或 DELETE 会影响整张表。",
  ],
  [
    "project",
    "SQL6 · 课程数据分析项目",
    "sql-project",
    "综合项目从问题出发：先确定答案需要哪些表，再连接、分组、排序。",
    "把 JOIN、GROUP BY 和 ORDER BY 组合起来",
    "找出报名人数最多的课程，并解释查询的每一步。",
    "复杂查询应逐段运行验证，不要一次写完再猜哪里错。",
  ],
]

const web = [
  [
    "html-structure",
    "W1 · HTML 页面骨架",
    "html-structure",
    "HTML 描述内容是什么，浏览器据此建立页面结构。",
    "元素、标签、属性与嵌套",
    "加入一个二级标题和两段正文。",
    "标签应正确闭合，并保持清楚的缩进。",
  ],
  [
    "html-semantics",
    "W2 · 语义化 HTML",
    "html-semantics",
    "header、nav、main、article 不只是盒子，也向浏览器和辅助技术说明内容职责。",
    "页面地标与内容层级",
    "为示例增加 footer，并放入版权说明。",
    "不要只为视觉效果选择标题级别。",
  ],
  [
    "html-forms",
    "W3 · 表单与输入",
    "html-forms",
    "表单把人的输入组织成可提交的数据，每个输入都应有可理解的标签。",
    "label、input、button 与基础校验",
    "增加一个必填的学习时长数字输入框。",
    "placeholder 不能代替 label。",
  ],
  [
    "css-basics",
    "W4 · CSS 选择器与样式",
    "css-basics",
    "CSS 用选择器找到元素，再用属性和值改变呈现。",
    "选择器、层叠和常用文字样式",
    "给正文设置合适的行高和最大宽度。",
    "样式没有生效时，先检查选择器是否真的选中元素。",
  ],
  [
    "css-box",
    "W5 · 盒模型",
    "css-box",
    "每个可见元素都可以理解为内容、内边距、边框和外边距四层盒子。",
    "width、padding、border、margin",
    "改变 padding 与 margin，比较哪个会扩大背景区域。",
    "默认 content-box 下，实际占用宽度不只等于 width。",
  ],
  [
    "css-layout",
    "W6 · Flex 与 Grid 布局",
    "css-layout",
    "Flex 适合沿一条轴排列，Grid 适合同时控制行和列。",
    "容器、轨道、间距与对齐",
    "把三列改为第一列固定 120px、其余平分。",
    "先在父元素设置 display，再配置子元素布局。",
  ],
  [
    "css-responsive",
    "W7 · 响应式设计",
    "css-responsive",
    "响应式页面根据可用空间调整布局，而不是为每种手机做一套网页。",
    "移动优先、媒体查询与弹性尺寸",
    "让侧栏在窄屏移动到正文下方。",
    "避免依赖某一款设备的固定像素宽度。",
  ],
  [
    "js-values",
    "W8 · JavaScript 变量与值",
    "js-values",
    "JavaScript 给网页加入行为；变量让程序记住会变化的数据。",
    "const、let、字符串、数字与布尔值",
    "新增 completed 布尔变量并输出一句进度说明。",
    "优先用 const，只在需要重新赋值时使用 let。",
  ],
  [
    "js-control",
    "W9 · 条件与循环",
    "js-control",
    "条件让程序选择路径，循环让同一规则作用于一批数据。",
    "if、三元表达式、for...of",
    "统计 scores 中优秀成绩的数量。",
    "循环条件写错可能造成无限循环。",
  ],
  [
    "js-functions",
    "W10 · JavaScript 函数",
    "js-functions",
    "函数把输入转换为输出，让一段规则可以命名、复用和测试。",
    "参数、返回值与箭头函数",
    "写一个 average 函数计算数字数组平均值。",
    "忘记 return 时，函数结果是 undefined。",
  ],
  [
    "js-dom",
    "W11 · DOM 与事件",
    "js-dom",
    "浏览器把 HTML 变成 DOM 树，JavaScript 可以读取和改变树上的节点。",
    "查询元素、事件监听和文本更新",
    "增加一个重置按钮，把计数恢复为 0。",
    "应等待元素存在后再获取它。",
  ],
  [
    "js-async",
    "W12 · 异步编程",
    "js-async",
    "网络和计时不会立刻完成，Promise 让程序在等待时继续处理其他事情。",
    "Promise、async 与 await",
    "把等待时间改为 500 毫秒，并在前后各输出一行。",
    "await 只能直接用于 async 函数或支持顶层 await 的模块。",
  ],
  [
    "js-project",
    "W13 · JavaScript 待办项目",
    "js-project",
    "小项目把输入、事件、DOM 更新和数据状态串成完整流程。",
    "从需求拆分数据与界面操作",
    "增加删除单条任务的按钮。",
    "界面显示与数据状态必须保持一致。",
  ],
  [
    "ts-types",
    "W14 · TypeScript 类型",
    "ts-types",
    "TypeScript 在运行前检查 JavaScript 中可能出现的类型错误。",
    "类型注解、对象类型与编译",
    "给课程对象增加 completed: boolean 字段。",
    "类型只负责检查，不会自动校验网络返回的数据。",
  ],
  [
    "ts-modeling",
    "W15 · TypeScript 数据建模",
    "ts-modeling",
    "联合类型和接口把业务规则写进代码，让不合法状态更难出现。",
    "interface、type 与字面量联合",
    "增加 blocked 状态，并创建一个对应任务。",
    "不要用 any 绕过本应解决的类型问题。",
  ],
  [
    "react-components",
    "W16 · React 组件",
    "react-components",
    "React 用组件描述界面，数据变化后由框架更新需要变化的部分。",
    "组件、JSX 与根节点",
    "提取一个 Welcome 组件并在 App 中使用。",
    "组件名必须以大写字母开头。",
  ],
  [
    "react-props",
    "W17 · React Props",
    "react-props",
    "Props 是父组件传给子组件的只读输入。",
    "组件参数、复用与列表",
    "给 Course 增加 level 属性并显示。",
    "子组件不应直接修改收到的 props。",
  ],
  [
    "react-state",
    "W18 · React State",
    "react-state",
    "State 保存会影响界面的可变信息，更新它会触发重新渲染。",
    "useState、事件与状态更新",
    "增加一个按钮把完成数量清零。",
    "不要直接修改 state 中的对象或数组。",
  ],
  [
    "react-project",
    "W19 · React 学习清单",
    "react-project",
    "综合练习用状态保存课程列表，用列表渲染生成界面。",
    "受控状态、数组更新与 key",
    "阻止重复添加 React，并显示课程总数。",
    "列表 key 应稳定且在同级中唯一。",
  ],
  [
    "node-runtime",
    "W20 · Node.js 运行环境",
    "node-runtime",
    "Node.js 让 JavaScript 离开网页，在电脑上访问文件、网络和系统能力。",
    "运行脚本、全局对象与浏览器差异",
    "在本机创建 app.js 并用 node app.js 执行。",
    "浏览器代码不能直接假设拥有 Node 的 fs 等模块。",
  ],
  [
    "node-modules",
    "W21 · 模块与 npm",
    "node-modules",
    "模块负责划分代码边界，npm 负责记录和安装项目依赖。",
    "package.json、import/export 与依赖",
    "在本机初始化项目，并把一个函数拆到独立模块。",
    "不要提交 node_modules，也不要盲目运行不可信包。",
  ],
  [
    "node-server",
    "W22 · Node HTTP 服务",
    "node-server",
    "HTTP 服务接收请求并返回状态码、响应头和正文。",
    "请求、响应、JSON 与端口",
    "按课程示例在本机启动服务，并访问 /api/hello。",
    "浏览器 Code Lab 只演示通用逻辑，服务器必须在本机 Node 中运行。",
  ],
]

function page([slug, title, lab, intro, concepts, task, mistake], items, track) {
  const index = items.findIndex((item) => item[0] === slug)
  const next = items[index + 1]
  const nextPath = next
    ? `[[programming/${track}/${next[0]}|${next[1]}]]`
    : "[[programming/index|返回编程学院，选择下一条路线]]"
  return `---
title: "${title}"
description: "${intro}"
last_verified: ${verified}
tags:
  - 编程学院
  - ${track === "sql" ? "SQL" : "Web"}
---

> [!abstract] 本课将学到
> ${concepts}。完成后，你会亲手修改示例并通过自动检查。

## 生活场景切入

${intro}先把它看成解决具体问题的工具，不需要一次记住所有语法。

## 核心概念

**${concepts.split("、")[0]}** 是本课的核心。阅读代码时，先找输入，再看处理规则，最后确认输出。遇到陌生符号时逐行运行，比死记定义更有效。

## 可运行示例

下面的 Code Lab 在浏览器内运行。代码和完成状态只保存在当前设备，不会上传到服务器。

<iframe src="/static/labs/lab?lesson=${lab}" class="widget-frame code-lab-frame" style="height:520px" title="${title} Code Lab"></iframe>

## 分步任务

1. 先运行默认代码，确认输出与代码的对应关系。
2. ${task}
3. 再运行一次，直到页面显示“检查通过”。
4. 用一句自己的话解释修改前后为什么不同。

## 常见错误

> [!warning] 先检查这一点
> ${mistake}

## 挑战题

不看默认示例，从空白开始写出一个更贴近你自己学习生活的版本。完成后刷新页面，确认代码仍能恢复。

> [!question]- 参考思路
> 先写出最小可运行版本，再一次只增加一个条件、字段或界面元素。每次修改后都运行，出错范围就会很小。

## 本章英文小词典

| 英文 | 中文 | 本课中的意思 |
| --- | --- | --- |
| runtime | 运行环境 | 真正执行代码的环境 |
| output | 输出 | 程序执行后产生的结果 |
| debug | 调试 | 定位并修正代码问题 |

## 下一步

${nextPath}
`
}

const academy = `---
title: 编程学院
description: 从 Python 数据分析到 SQL 与现代 Web 开发的原创中文学习路线
last_verified: ${verified}
---

> [!abstract] 从“看懂代码”走到“独立完成项目”
> 编程学院包含 **Python 与数据（16 课）**、**SQL（6 课）**、**Web 开发（22 课）**。建议按顺序学习，也可以根据目标选择一条路线。

<iframe src="/static/labs/progress.html" class="widget-frame code-lab-progress" style="height:240px" title="编程学院本机学习进度"></iframe>

## 三条学习路线

- **[Python 与数据](/prerequisites/python/)**：适合 AI、自动化与数据分析学习者，不要求编程前置。
- **[SQL 数据库](/programming/sql/)**：学习查询和分析结构化数据，建议先完成 Python P1–P5 或具备同等基础。
- **[Web 开发](/programming/web/)**：从网页结构一路学到 React 与本机 Node.js，不要求编程前置。

\`\`\`mermaid
flowchart LR
  A[Python 基础] --> B[NumPy / Pandas]
  B --> C[SQL 数据分析]
  D[HTML / CSS] --> E[JavaScript]
  E --> F[TypeScript / React]
  F --> G[本机 Node.js]
\`\`\`

## 如何使用 Code Lab

每课先运行默认代码，再完成分步任务。代码、完成状态和最近学习位置保存在浏览器本机；没有账号，也不会上传代码。Python 数据包首次使用需要联网下载。Node.js、真实爬虫、文件自动化和外部 API 项目会明确要求在本机环境完成。

## W3Schools 对照资源

本站课程为原创中文内容。以下链接用于查阅参考手册和补充练习：

| 主题 | W3Schools 官方资源 |
| --- | --- |
| Python | [Python Tutorial](https://www.w3schools.com/python/) |
| NumPy / Pandas | [NumPy](https://www.w3schools.com/python/numpy/) · [Pandas](https://www.w3schools.com/python/pandas/) |
| SQL | [SQL Tutorial](https://www.w3schools.com/sql/) |
| HTML / CSS / JavaScript | [HTML](https://www.w3schools.com/html/) · [CSS](https://www.w3schools.com/css/) · [JavaScript](https://www.w3schools.com/js/) |
| TypeScript / React / Node.js | [TypeScript](https://www.w3schools.com/typescript/) · [React](https://www.w3schools.com/react/) · [Node.js](https://www.w3schools.com/nodejs/) |
| Git | [Git Tutorial](https://www.w3schools.com/git/) |

> [!note] 独立性与版权说明
> 本站不是 W3Schools 官方合作项目，不代表或隶属于 W3Schools。本站不镜像、不批量翻译其教程；外部页面的内容、账户和隐私政策由 W3Schools 负责。
`

function indexPage(title, description, items, track) {
  return `---
title: ${title}
description: ${description}
last_verified: ${verified}
---

> [!abstract] 学习方式
> 按顺序完成课程。每课包含可运行示例、分步任务、常见错误和挑战题，进度只保存在当前浏览器。

## 课程顺序

| # | 课程 | 状态 |
| --- | --- | --- |
${items.map((item, i) => `| ${track === "sql" ? `SQL${i + 1}` : `W${i + 1}`} | [${item[1].replace(/^.+? · /, "")}](/programming/${track}/${item[0]}) | ✅ |`).join("\n")}

## 学完之后

${track === "sql" ? "回到 [[programming/index|编程学院]]，把 SQL 与 Python/Pandas 结合完成数据分析项目。" : "完成 W22 后，你已经走过原生网页、类型系统、React 和 Node.js 入门。继续用一个自己的小项目巩固整条路线。"}
`
}

await mkdir(path.join(root, "sql"), { recursive: true })
await mkdir(path.join(root, "web"), { recursive: true })
await writeFile(path.join(root, "index.md"), academy)
await writeFile(
  path.join(root, "sql", "index.md"),
  indexPage("SQL 数据库", "从查询一张表到完成多表数据分析", sql, "sql"),
)
await writeFile(
  path.join(root, "web", "index.md"),
  indexPage("Web 开发", "从 HTML、CSS、JavaScript 到 TypeScript、React 与 Node.js", web, "web"),
)
for (const item of sql)
  await writeFile(path.join(root, "sql", `${item[0]}.md`), page(item, sql, "sql"))
for (const item of web)
  await writeFile(path.join(root, "web", `${item[0]}.md`), page(item, web, "web"))

const pythonLabs = {
  "install-python.md": "python-first-run",
  "variables.md": "python-variables",
  "lists-dicts.md": "python-collections",
  "control-flow.md": "python-control-flow",
  "functions.md": "python-functions",
  "classes.md": "python-classes",
  "numpy.md": "python-numpy",
  "pandas.md": "python-pandas",
  "matplotlib.md": "python-matplotlib",
  "capstone.md": "python-capstone",
  "automation.md": "python-automation",
  "regex.md": "python-regex",
  "git-basics.md": "git-basics",
  "chatbot.md": "python-chatbot",
  "web-scraping.md": "python-scraping",
  "data-analysis.md": "python-data-analysis",
}

const pythonRoot = path.resolve("content/prerequisites/python")
for (const [filename, lab] of Object.entries(pythonLabs)) {
  const file = path.join(pythonRoot, filename)
  let content = await readFile(file, "utf8")
  content = content.replaceAll("/static/labs/lab.html?lesson=", "/static/labs/lab?lesson=")
  if (!/^last_verified:/m.test(content)) {
    content = content.replace(/^(description:.*)$/m, `$1\nlast_verified: ${verified}`)
  }
  if (!content.includes("/static/labs/lab?lesson=")) {
    const title = content.match(/^title:\s*["']?(.+?)["']?$/m)?.[1] || filename
    const restricted = ["automation.md", "chatbot.md", "web-scraping.md"].includes(filename)
    const labSection = `## Code Lab：亲手运行\n\n下面的实验会真实执行代码，内容和完成状态只保存在当前浏览器。${restricted ? "浏览器实验使用虚拟文件或固定响应；真实系统、网络和 API 项目请继续完成后面的本机步骤，API Key 只能放在环境变量中。" : "先运行默认代码，再按本课任务修改。"}\n\n<iframe src="/static/labs/lab?lesson=${lab}" class="widget-frame code-lab-frame" style="height:520px" title="${title} Code Lab"></iframe>\n\n### 分步任务\n\n1. 运行默认代码并解释输入、处理和输出。\n2. 修改一个值或条件，预测结果后再次运行。\n3. 完成本课挑战，直到自动检查通过。\n\n`
    const marker = content.includes("## 自测一下") ? "## 自测一下" : "## 下一步"
    content = content.replace(marker, `${labSection}${marker}`)
  }
  await writeFile(file, content)
}

const pythonIndex = `---
title: Python 编程
description: 从第一行代码到数据分析、自动化、Git 和 AI 应用的 16 课路线
last_verified: ${verified}
---

> [!abstract] 零基础也可以开始
> 课程按“基础语法 → AI 数据工具 → 真实项目”排列。每课都包含浏览器 Code Lab；代码和进度只保存在本机。

## 学习顺序

| # | 课程 | 你会解决的问题 | 状态 |
| --- | --- | --- | --- |
| P1 | [安装与第一段 Python](/prerequisites/python/install-python) | 让代码真正运行 | ✅ |
| P2 | [变量与数据类型](/prerequisites/python/variables) | 让程序记住信息 | ✅ |
| P3 | [列表与字典](/prerequisites/python/lists-dicts) | 组织一批数据 | ✅ |
| P4 | [条件与循环](/prerequisites/python/control-flow) | 让程序选择和重复 | ✅ |
| P5 | [函数](/prerequisites/python/functions) | 封装可复用规则 | ✅ |
| P6 | [类与对象](/prerequisites/python/classes) | 看懂 PyTorch 常见写法 | ✅ |
| P7 | [NumPy](/prerequisites/python/numpy) | 批量进行数值计算 | ✅ |
| P8 | [Pandas](/prerequisites/python/pandas) | 清洗和分析表格 | ✅ |
| P9 | [Matplotlib](/prerequisites/python/matplotlib) | 把数据变成图表 | ✅ |
| P10 | [数据分析综合项目](/prerequisites/python/capstone) | 串联 P1–P9 | ✅ |
| P11 | [自动化实战](/prerequisites/python/automation) | 处理虚拟与本机文件 | ✅ |
| P12 | [正则表达式](/prerequisites/python/regex) | 从文本提取信息 | ✅ |
| P13 | [Git 版本控制](/prerequisites/python/git-basics) | 在虚拟仓库真实提交 | ✅ |
| P14 | [聊天机器人](/prerequisites/python/chatbot) | 安全处理 API 调用 | ✅ |
| P15 | [爬虫入门](/prerequisites/python/web-scraping) | 从固定页面到合规采集 | ✅ |
| P16 | [数据分析入门](/prerequisites/python/data-analysis) | 从问题走到结论 | ✅ |

## 浏览器练习与本机项目

标准 Python、NumPy 和 Pandas 在浏览器内真实执行。Git 使用浏览器虚拟文件系统。自动化、爬虫和聊天机器人采用双轨教学：先在本站完成安全练习，再按讲义在本机访问文件或网络；任何 API Key 都不得写入网页或 Git。

## 下一步

完成 P1–P10 后，可以进入 [[programming/sql/index|SQL 数据库]]；想制作网页和应用，可以从 [[programming/web/index|Web 开发]] 开始。全部路线见 [[programming/index|编程学院]]。
`
await writeFile(path.join(pythonRoot, "index.md"), pythonIndex)

console.log(
  `Generated ${sql.length + web.length + 3} programming pages and integrated ${Object.keys(pythonLabs).length} Python lessons.`,
)
