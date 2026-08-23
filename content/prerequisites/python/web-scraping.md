---
title: Python 爬虫入门：让电脑帮你收集数据 Web Scraping with Python
description: 用 requests + 正则/BeautifulSoup 自动采集网页数据——从单页抓取到批量下载，数据分析的第一步
last_verified: 2026-08-24
---

> [!abstract] 本课将学到
>
> - **爬虫（Web Scraping）**是什么：自动从网页中提取数据的程序
> - `requests` 库：向网页发请求、拿回 HTML
> - 两种解析方式：正则表达式快速提取 vs BeautifulSoup 结构化解析
> - 爬虫的道德与法律边界——什么该爬、什么不该碰

## 生活场景切入

你想做一个「全国城市房价对比」的分析报告。手动打开 50 个房产网站逐个抄数据？三天。写一个爬虫？**30 分钟**。

```text
你写的爬虫每天早上自动运行：
  → 打开 50 个网页
  → 提取每个页面的房价数据
  → 存入 Excel
  → 你起床后打开 Excel 就能看到最新对比表
```

爬虫是 Python 最热门的应用之一——因为**数据是一切分析的前提**，而互联网上全是数据。

## 概念 1：网页的真相 —— 你看到的 vs 浏览器收到的

你在浏览器里看到的是排版好的漂亮页面；但浏览器实际收到的是一段 **HTML 文本**：

```html
<html>
  <body>
    <div class="article">
      <h2 class="title">Python 入门指南</h2>
      <a href="/detail/1">阅读更多</a>
    </div>
    <div class="article">
      <h2 class="title">AI 基础教程</h2>
      <a href="/detail/2">阅读更多</a>
    </div>
  </body>
</html>
```

爬虫的工作就是：**请求这段 HTML → 从中提取你需要的数据**。

## 概念 2：requests —— 向网页发请求

```bash
pip install requests
```

```python
import requests

response = requests.get("https://example.com")
print(response.status_code)     # 200 = 成功，404 = 页面不存在
print(response.text[:200])      # 打印 HTML 的前 200 个字符
```

三个必须知道的属性：

| 属性          | 含义             | 常用判断                           |
| ------------- | ---------------- | ---------------------------------- |
| `status_code` | HTTP 状态码      | 200=成功, 404=不存在, 403=拒绝访问 |
| `text`        | 响应正文（HTML） | 后续解析的对象                     |
| `headers`     | 响应头           | 有时需要检查 Content-Type          |

### 加上 Headers —— 让爬虫「像人一样」

很多网站会检测非浏览器请求并拒绝：

```python
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ..."
}
response = requests.get(url, headers=headers)   # 伪装成浏览器
```

没有 User-Agent 的请求默认标为 `python-requests`——网站一看就知道是爬虫。加上浏览器常见的 UA 字符串可以绕过最基础的检测。

## 概念 3：解析 HTML —— 两种方法

### 方法一：正则表达式（简单场景够用）

```python
import re

fake_html = '<h2 class="title">Python 入门指南</h2>'
fake_html += '<a href="/detail/1">阅读更多</a>'
# （实际是从 response.text 获取）

titles = re.findall(r'class="title">(.*?)</h2>', fake_html)
links = re.findall(r'href="(/detail/\d+)"', fake_html)

print("标题:", titles)    # ['Python 入门指南', 'AI 基础教程']
print("链接:", links)     # ['/detail/1', '/detail/2']
```

优点：零依赖、快。缺点：HTML 结构稍变就崩——只适合结构稳定的页面。

### 方法二：BeautifulSoup（推荐，更健壮）

```bash
pip install beautifulsoup4
```

```python
from bs4 import BeautifulSoup

soup = BeautifulSoup(fake_html, "html.parser")

# 按标签名找
titles = [h2.text for h2 in soup.find_all("h2")]
print(titles)   # ['Python 入门指南', 'AI 基础教程']

# 按 class 找
articles = soup.find_all("div", class_="article")
for a in articles:
    title = a.find("h2", class_="title").text
    link = a.find("a")["href"]
    print(f"{title} → {link}")

# Python 入门指南 → /detail/1
# AI 基础教程 → /detail/2
```

BeautifulSoup 把 HTML 解析成**对象树**，你可以像操作目录树一样精准定位元素。即使 HTML 格式不完美也能容错处理。

## 实战：批量采集并保存到 CSV

```python
import requests
from bs4 import BeautifulSoup
import csv
import time

def scrape_page(url):
    """抓取单个页面并返回数据"""
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    data = []
    for article in soup.find_all("div", class_="article"):
        title = article.find("h2", class_="title")
        link = article.find("a")
        if title and link:
            data.append({
                "title": title.text.strip(),
                "url": link["href"]
            })
    return data

def scrape_multiple(urls):
    """批量抓取多个页面"""
    all_data = []
    for i, url in enumerate(urls):
        print(f"正在抓取第 {i+1}/{len(urls)} 页...")
        page_data = scrape_page(url)
        all_data.extend(page_data)
        time.sleep(2)   # ← 礼貌间隔！每次请求后等 2 秒
    return all_data

# 保存到 CSV
urls = [f"https://example.com/page/{i}" for i in range(1, 6)]
data = scrape_multiple(urls)

with open("results.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["title", "url"])
    writer.writeheader()
    writer.writerows(data)
print(f"共采集 {len(data)} 条数据，已保存到 results.csv")
```

注意 `time.sleep(2)`——这是爬虫的礼仪底线（下一节详讲）。

## 爬虫的道德与法律红线 ★必读★

```text
✅ 可以做：
   抓取公开可见的数据用于个人学习/研究
   遵守 robots.txt（网站对爬虫的规则声明）
   控制频率，不对服务器造成压力
   不绕过登录/付费墙获取非公开内容

❌ 不可以做：
   高频暴力请求（等于 DDOS 攻击）
   绕过反爬机制获取隐私数据
   将抓取的数据商用而不注明来源
   爬取需要登录才能看的页面内容并公开
```

一句话原则：**你的爬虫不应该对目标网站造成任何它不会从普通用户那里承受的额外负担**。

## 本章英文小词典

| 英文            | 中文        | 一句话记忆                   |
| --------------- | ----------- | ---------------------------- |
| Web scraping    | 网络爬虫    | 自动从网页提取数据           |
| Request         | 请求        | 向服务器要数据               |
| Response        | 响应        | 服务器返回的内容             |
| HTML parser     | HTML 解析器 | 把 HTML 变成可操作的对象树   |
| User-Agent (UA) | 用户代理    | 标识你是谁的字符串           |
| Rate limiting   | 频率限制    | 控制请求速度                 |
| Robots.txt      | 爬虫协议    | 网站对爬虫的「行为准则」声明 |
| API vs Scraping | API vs 爬取 | 有官方接口优先用接口         |

## 自测一下

> [!question]- 1. 为什么有些网站用 `requests.get()` 拿到的内容和浏览器里看到的不一样？
> 因为现代网站大量使用 **JavaScript 动态渲染**——服务器返回的 HTML 是个空壳，真正的内容由 JS 在浏览器里执行后才填充进去。
> `requests` 只拿到原始 HTML（空壳），不做 JS 渲染。
> 解决方案：① 找网站底层的 API 接口直接调用（按 F12 Network 面板找 JSON）；② 使用 Selenium/Playwright 等无头浏览器工具模拟真实浏览器。

> [!question]- 2. `time.sleep(2)` 在爬虫中的作用是什么？如果不加会怎样？
> 作用：控制请求频率，给目标服务器喘息时间。
> 不加的后果：① 你的 IP 可能被网站封禁（返回 403 或验证码）；② 大量并发请求可能压垮小网站的服务器（性质接近 DoS 攻击）；③ 违反某些网站的 Terms of Service 可能面临法律风险。
> 合理范围：每 1~3 秒一个请求是礼貌的基线；大规模采集应使用分布式方案并严格控速。

> [!question]- 3. BeautifulSoup 和正则各适合什么场景？给出一个「必须用 BS4」和一个「正则更好」的例子。
> 必须用 BS4：**嵌套结构的层级提取**——比如「找出所有 div.article 里 h2.title 的文字」，BS4 用 `soup.select("div.article h2.title")` 一行搞定，正则处理任意深度的嵌套几乎不可能写出可靠的匹配。
> 正则更好：**简单的模式提取**——比如从纯文本（不是 HTML）中提取手机号 `re.findall(r"1[3-9]\d{9}", text)`。正则轻快且无需安装额外库。
> 经验法则：**结构化 HTML→BS4，非结构化文本→正则**。

> [!question]- 4. 你想爬取某电商网站上所有商品的价格来追踪价格变化。设计完整方案，包含合规考量。
> 方案：
> 数据层——① 每天定时（如凌晨 3 点低峰期）爬取目标商品页面；② 提取商品名+当前价格+日期；③ 追加存入 SQLite/CSV（保留历史记录用于趋势分析）。
> 合规层——④ 查看 robots.txt 确认允许爬取商品页；⑤ 设置 3~5 秒间隔避免影响正常服务；⑥ 只存自己需要的数据字段不存储无关用户信息；
> 异常处理——⑦ 价格页面改版时捕获解析错误并通知（而非静默失败）；⑧ 被限流时指数退避而非硬闯；
> 分析层——⑨ 用 P9 Matplotlib 画价格趋势图；⑩ 设定阈值降价提醒。
> 思想框架：技术实现只是 20%，合规设计和容错规划才是决定项目能否长期运行的关键。

## 下一步

- [[prerequisites/python/git-basics|P13 · Git 版本控制]]——给你的爬虫项目装时间机器
- 相关：[[ai/ml/house-price-project|ML10 房价预测]]——爬到的数据正好用来做分析

→ 返回 [[prerequisites/python/index|🐍 Python 目录]]
