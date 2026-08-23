---
title: Python 自动化实战：让电脑替你干活 Python Automation
description: 批量重命名、Excel 处理、文件整理——三招解放重复劳动，每天省下一小时
last_verified: 2026-08-24
---

> [!abstract] 本课将学到
>
> - **批量重命名**：一键清理 100 个文件的垃圾文件名
> - **CSV/Excel 数据处理**：排序、求和、筛选——不用打开 Excel
> - **自动整理下载文件夹**：按扩展名归档到对应目录
> - 每个脚本 ≤20 行，全部实测可跑

## 生活场景切入

你的下载文件夹是不是这样的：

```text
报告(1).pdf
报告(2).pdf
笔记(最终版).docx
笔记(最终版)v2.docx
screenshot_20260823_142031.png
screenshot_20260823_153344.png
未命名文件夹/
```

手动改名？100 个文件要一小时。写个 10 行脚本？一秒搞定，而且以后每次都能复用。**编程最大的价值不是造火箭，是消灭重复劳动**——本课教你三个最实用的自动化脚本。

## 实战 1：批量清理文件名

需求：把 `报告(1).pdf` 变成 `报告.pdf`，去掉所有 `(1)` `(最终版)v2` 这类垃圾字符。

```python
import os, re

folder = "./downloads"   # 目标文件夹路径

for filename in os.listdir(folder):
    name, ext = os.path.splitext(filename)
    # 用正则删掉 (数字)、(最终版)、v数字 等模式
    clean = re.sub(r"\(\d+\)|\(最终版\)|v\d+", "", name).strip()
    new_name = clean + ext

    if new_name != filename:
        old_path = os.path.join(folder, filename)
        new_path = os.path.join(folder, new_name)
        os.rename(old_path, new_path)
        print(f"  {filename} → {new_name}")

# 实测输出:
#   报告(1).pdf → 报告.pdf
#   笔记(最终版)v2.docx → 笔记.docx
```

逐行拆解：

| 代码                     | 干什么                 | 出自哪课             |
| ------------------------ | ---------------------- | -------------------- |
| `os.listdir()`           | 列出文件夹里所有文件名 | P7 文件操作          |
| `os.path.splitext()`     | 拆分文件名和扩展名     | —                    |
| `re.sub(r"模式", "", s)` | 用正则替换匹配到的文字 | 正则表达式的核心用法 |

⚠️ **安全提示**：第一次运行前先用 `print(new_name)` 预览而不真正 rename——确认无误后再执行。

## 实战 2：CSV 数据处理 —— 不打开 Excel 做统计

场景：老师给你一个成绩 CSV，要你算总分排名。

```python
import csv, io

csv_data = "姓名,语文,数学\n张三,85,92\n李四,78,95\n王五,90,88"

# 读入并计算总分
rows = list(csv.DictReader(io.StringIO(csv_data)))
for r in rows:
    r["总分"] = int(r["语文"]) + int(r["数学"])

# 排序输出
rows.sort(key=lambda x: x["总分"], reverse=True)
for i, r in enumerate(rows):
    print(f"第{i+1}名: {r['姓名']} 总分{r['总分']}")

# 实测输出:
# 第1名: 王五 总分178
# 第2名: 张三 总分177
# 第3名: 李四 总分173
```

升级到真 Excel（`.xlsx`）只需换库：

```bash
pip install openpyxl
```

```python
from openpyxl import load_workbook

wb = load_workbook("成绩.xlsx")
ws = wb.active
for row in ws.iter_rows(min_row=2, values_only=True):   # 跳过表头
    print(row)    # (姓名, 语文, 数学)
```

P8 学的 Pandas 也能做同样的事且更简洁——但理解底层逻辑后你才知道 Pandas 在帮你做什么。

## 实战 3：自动整理下载文件夹

需求：把杂乱的下载文件夹按类型归档到子目录：

```python
import os, shutil

folder = "./downloads"
rules = {
    ".pdf": "文档", ".docx": "文档", ".xlsx": "文档",
    ".png": "图片", ".jpg": "图片",
    ".zip": "压缩包", ".rar": "压缩包",
    ".mp4": "视频",
}

for filename in os.listdir(folder):
    src = os.path.join(folder, filename)
    if not os.path.isfile(src):
        continue                              # 跳过子目录本身
    ext = os.path.splitext(filename)[1].lower()
    target_dir = rules.get(ext, "其他")       # 未知类型进「其他」
    target_folder = os.path.join(folder, target_dir)

    os.makedirs(target_folder, exist_ok=True)  # 目录不存在就建
    shutil.move(src, os.path.join(target_folder, filename))
    print(f"  {filename} → {target_dir}/")
```

这个 15 行的脚本可以设成 Windows 定时任务或 macOS crontab，每天自动整理一次——**写一次，永远生效**。

## 自动化的思维框架

写任何自动化脚本前先回答三个问题：

```text
① 输入是什么？（哪些文件 / 什么格式）
② 要做什么变换？（重命名 / 移动 / 计算 / 格式转换）
③ 输出到哪里？（原地修改 / 新目录 / 生成新文件）
```

想清楚这三问，代码就是「遍历 → 处理 → 输出」的三步循环。所有本课脚本的骨架都是它。

## 本章英文小词典

| 英文               | 中文       | 一句话记忆                    |
| ------------------ | ---------- | ----------------------------- |
| Automation         | 自动化     | 让机器做重复的事              |
| Batch processing   | 批处理     | 一次性处理一大批              |
| File extension     | 文件扩展名 | .pdf .png 这些后缀            |
| Regular expression | 正则表达式 | 文字模式的搜索与替换利器      |
| Rename             | 重命名     | os.rename(old, new)           |
| shutil.move        | 移动文件   | shutil 是 os 的文件操作增强版 |

## 自测一下

> [!question]- 1. 为什么批量重命名要先 `os.path.splitext()` 再处理？
> 因为正则可能匹配到扩展名里的字符。比如文件叫 `report(v2).pdf`，如果不拆分直接对全名做替换，`.pdf` 的 `p` 虽然不会被 `\(\d+\)` 匹配到，但如果正则包含更宽泛的模式就可能误伤扩展名。
> 先拆后拼保证了**只改名字部分，扩展名原样保留**——这是批量操作的防御性编程习惯：缩小每一步的影响范围。

> [!question]- 2. 如果目标文件夹下已经有同名文件，`shutil.move()` 会怎样？怎么防止意外覆盖？
> 默认行为是**静默覆盖**——旧文件被新文件替代且无任何警告。
> 防覆盖方案：移动前检查 `os.path.exists(target)`，存在则在文件名后加时间戳或序号（如 `报告_20260824.pdf`）。或者用 `shutil.copy2()` + 手动删除源文件，在中间插入检查逻辑。
> 自动化脚本最大的风险就是「不可逆操作没有保护」——**宁可多一行检查，不要丢一份文件**。

> [!question]- 3. 把实战 2 改造成「读入真实 Excel 并追加一列平均分」，写出核心代码。
>
> ```python
> from openpyxl import load_workbook
>
> wb = load_workbook("成绩.xlsx")
> ws = wb.active
> ws.cell(row=1, column=4, value="平均分")       # 表头
> for row in range(2, ws.max_row + 1):
>     chinese = ws.cell(row=row, column=2).value
>     math = ws.cell(row=row, column=3).value
>     avg = round((chinese + math) / 2, 1)
>     ws.cell(row=row, column=4, value=avg)
> wb.save("成绩_已处理.xlsx")                    # 另存不改原文件
> ```
>
> 关键点：① `max_row` 自动获取数据行数；② 结果另存而非覆盖原件（ML9 测试集纪律的文件版）。

> [!question]- 4. 你每周都要从 5 个网站复制数据粘贴到一个汇总表。如何判断这件事值不值得写成自动化脚本？给出判断公式。
> 判断公式：**如果 (每周耗时 × 52周) > (写脚本耗时 × 1 + 维护耗时 × 52)**，则值得自动化。
> 例：每周花 30 分钟 → 年耗时 26 小时；写脚本 4 小时 + 维护 0.5×52=26 小时 → 不划算（除非能减少维护）。
> 但如果加上「减少人为错误」和「可复用于其他项目」的无形收益，门槛可以放宽。经验法则：**每周 ≥15 分钟的纯重复操作都值得考虑自动化**。

## 下一步

- [[prerequisites/python/regex|下一篇 · 正则表达式]]——本课多次出现的 `re.sub()` 到底怎么写
- 相关：[[prerequisites/python/pandas|P8 Pandas]]——更强大的数据处理工具

→ 返回 [[prerequisites/python/index|🐍 Python 目录]]
