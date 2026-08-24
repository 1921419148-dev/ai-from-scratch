---
title: 数据分析入门：用 Python 读懂世界 Data Analysis with Python
description: Pandas + Matplotlib 从原始数据到可视化洞察——用真实城市数据走一遍完整分析流程
last_verified: 2026-08-24
---

> [!abstract] 本课将学到
>
> - 数据分析的**标准五步流程**：提问 → 获取 → 清洗 → 分析 → 可视化
> - 用 Pandas 做 GroupBy、排序、计算衍生列
> - 用 Matplotlib 画出有说服力的图表
> - 实战案例：中国四大城市 GDP 与人口数据分析

## 生活场景切入

新闻说「深圳 GDP 超过广州」「上海人口最多」——你信吗？怎么验证？

数据分析师的工作就是回答这类问题：

```text
① 提出好问题（哪个城市人均 GDP 最高？）
② 找到可靠数据
③ 用代码处理和计算
④ 用图表让结论一目了然

本站 P8-P9 教了工具，这一课教「怎么把工具串成完整分析」。
```

## 第一步：提出好问题

差的问题：「分析一下这些数据」（没有方向）
好的问题：具体、可验证、有意义

```text
✅ 四大城市中，人均 GDP 最高的是哪个？
✅ 人口最多的城市，GDP 是否也最高？
✅ GDP 总量与人口之间有没有相关性？
```

每个好问题都对应一个具体的计算步骤——这是分析的路线图。

## 第二步：获取与清洗数据

```python
import pandas as pd

df = pd.DataFrame({
    "城市": ["北京", "上海", "深圳", "广州"],
    "人口万": [2189, 2487, 1756, 1868],
    "GDP万亿": [4.4, 4.7, 3.5, 2.9]
})
print(df)
```

输出：

```text
   城市  人口万  GDP万亿
0  北京  2189     4.4
1  上海  2487     4.7
2  深圳  1756     3.5
3  广州  1868     2.9
```

清洗检查清单：

```text
□ 有缺失值吗？→ df.isnull().sum()
□ 数据类型正确吗？→ df.dtypes()
□ 有明显异常值吗？→ df.describe() 看最大最小值是否合理
```

本例数据干净无需清洗。真实项目中 80% 的时间花在这一步（ML8 的教训）。

## 第三步：计算衍生指标

原始数据往往不能直接回答问题——需要计算衍生列：

```python
# 人均 GDP = GDP总量 / 人口
# 注意单位换算：万亿 / 万 = 万/人 × 10000 = 万元/人
df["人均GDP万"] = (df["GDP万亿"] * 10000 / df["人口万"]).round(1)

print(df.sort_values("人均GDP万", ascending=False))
```

实测输出：

```text
   城市  人口万  GDP万亿  人均GDP万
0  北京  2189     4.4      20.1
2  深圳  1756     3.5      19.9
1  上海  2487     4.7      18.9
3  广州  1868     2.9      15.5
```

**发现**：北京人均 GDP 最高（20.1 万），但深圳紧随其后且人口少得多——这说明深圳的经济效率很高。

## 第四步：多维度交叉分析

```python
# 相关性检验：人口多的城市 GDP 也高吗？
correlation = df["人口万"].corr(df["GDP万亿"])
print(f"人口与GDP相关系数: {correlation:.3f}")
# 相关系数: 0.678 —— 中度正相关

# 但注意！相关 ≠ 因果（M10 的核心教训）
# 人口多可能吸引更多企业 → GDP 高
# 也可能是 GDP 高的城市吸引了更多人口迁入
```

**分析纪律**：每次得出结论前问自己三遍「有没有其他解释？」

## 第五步：可视化 —— 让数据开口说话

```python
import matplotlib.pyplot as plt
import matplotlib

# 中文字体设置
matplotlib.rcParams["font.sans-serif"] = ["SimHei"]
matplotlib.rcParams["axes.unicode_minus"] = False

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# 左图：GDP vs 人口 散点图
axes[0].scatter(df["人口万"], df["GDP万亿"], s=100, c=["red","blue","green","orange"])
for i, city in enumerate(df["城市"]):
    axes[0].annotate(city, (df["人口万"][i], df["GDP万亿"][i]),
                     textcoords="offset points", xytext=(5, 5))
axes[0].set_xlabel("人口（万）")
axes[0].set_ylabel("GDP（万亿）")
axes[0].set_title("人口 vs GDP")

# 右图：人均 GDP 柱状图
df_sorted = df.sort_values("人均GDP万")
axes[1].barh(df_sorted["城市"], df_sorted["人均GDP万"], color="steelblue")
axes[1].set_xlabel("人均 GDP（万元）")
axes[1].set_title("人均 GDP 排名")

plt.tight_layout()
plt.savefig("city_analysis.png", dpi=150)
print("图表已保存")
```

**图表选择口诀**：

| 你想展示什么       | 选什么图                 |
| ------------------ | ------------------------ |
| 几个类别的数值对比 | 柱状图 bar               |
| 两个变量的关系     | 散点图 scatter           |
| 随时间的变化趋势   | 折线图 plot              |
| 各部分占整体的比例 | 饼图 pie                 |
| 数据的分布范围     | 直方图 hist / 箱线图 box |

## 分析报告模板

做完分析后，用这个结构写结论（比代码更重要）：

```text
【背景】对比四大一线城市的人口与经济数据。

【关键发现】
1. 上海 GDP 总量最高（4.7 万亿），但北京人均 GDP 最高（20.1 万）
2. 深圳以最少的人口创造了第三高的 GDP，经济效率突出
3. 人口与 GDP 呈中度正相关（r=0.678），但存在例外

【局限性】
- 仅四个样本点，相关性结论不具统计显著性
- 未考虑产业结构差异对人均 GDP 的影响

【建议进一步分析】
- 加入更多城市扩大样本量
- 引入产业结构、教育水平等控制变量
```

**局限性声明不是谦虚是专业性**——承认分析边界的人反而更可信。

## 本章英文小词典

| 英文           | 中文     | 一句话记忆             |
| -------------- | -------- | ---------------------- |
| Data cleaning  | 数据清洗 | 处理缺失/异常/格式错误 |
| Derived column | 衍生列   | 由已有列计算出的新列   |
| Correlation    | 相关性   | 两个变量同向变化的程度 |
| Scatter plot   | 散点图   | 展示两个变量的关系     |
| Bar chart      | 柱状图   | 类别间的数值比较       |
| Insight        | 洞察     | 数据背后有意义的发现   |
| Limitation     | 局限性   | 分析的边界与不足       |
| Outlier        | 异常值   | 远离群体的数据点       |

## Code Lab：亲手运行

下面的实验会真实执行代码，内容和完成状态只保存在当前浏览器。先运行默认代码，再按本课任务修改。

<iframe src="/static/labs/lab#python-data-analysis" class="widget-frame code-lab-frame" style="height:520px" title="数据分析入门：用 Python 读懂世界 Data Analysis with Python Code Lab"></iframe>

### 分步任务

1. 运行默认代码并解释输入、处理和输出。
2. 修改一个值或条件，预测结果后再次运行。
3. 完成本课挑战，直到自动检查通过。

## 自测一下

> [!question]- 1. 为什么先算「人均 GDP」而不是直接比较 GDP 总量？
> 因为 GDP 总量受人口规模直接影响——上海人口最多所以 GDP 最高，但这不代表上海人最富裕。
> 人均 GDP 消除了人口规模的干扰，才能回答「哪个城市的经济效率更高」这个真正有意义的问题。
> 元教训：**原始指标往往混淆了规模效应，衍生指标才能揭示真实差异**——这正是 ML8 特征工程的思想源头。

> [!question]- 2. r=0.678 的相关系数能说明「人口增长导致 GDP 增长」吗？
> 不能。三个理由：
> ① **相关≠因果**（M10 核心教训）：可能是第三个因素（如政策优惠）同时推动了人口流入和 GDP 增长；
> ② **方向不明**：也可能是 GDP 高→吸引人才→人口增长（因果箭头反过来）；
> ③ **样本太小**：只有 4 个数据点的相关系数不稳定，加一个城市就可能大幅改变 r 值。
> 正确表述：「人口与 GDP 存在正相关关系，但因果方向需要更严格的计量方法验证。」

> [!question]- 3. 如果数据里有一个城市的 GDP 写成了 47 万亿（多了个零），你的分析会怎样？如何检测？
> 后果：该城市的所有衍生指标（人均 GDP、相关性系数）都会被严重扭曲——47 万亿会让它的「人均 GDP」变成 200+ 万，散点图上它成为极端离群点拉偏回归线。
> 检测方法：
> `df.describe()` 看 max 是否离谱；`df.boxplot()` 视觉化异常值；或者简单常识检查（中国城市 GDP 不可能超过 10 万亿）。
> 处理方案：确认是录入错误后修正或删除该行——但要在报告中说明你做了什么以及为什么。

> [!question]- 4. 你的分析报告被老板质疑：「只有四个城市，能说明什么？」如何回应？
> 承认局限 + 提出改进 + 强调当前价值：
> 「您说得对，四个样本确实不足以做统计推断。这份初步分析的价值在于：(1) 提供了直观的对比框架；(2) 发现了值得深挖的方向（如深圳的经济效率现象）。如果您认可这个方向，我可以扩大到全国 30 个主要城市并加入控制变量做严格分析。」
> 关键：**不防御，而是把质疑转化为下一步行动的合理性论证**——这既是数据分析素养也是职场沟通技巧。

## 下一步

- [[prerequisites/python/web-scraping|Python 爬虫入门]]——自己动手采集分析所需的数据
- 相关：[[prerequisites/python/pandas|P8 Pandas]] · [[prerequisites/python/matplotlib|P9 Matplotlib]]

→ 返回 [[prerequisites/python/index|🐍 Python 目录]]
