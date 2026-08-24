---
title: NumPy：数字的瑞士军刀 NumPy Essentials
description: AI 数值计算的事实标准——一个 ndarray 对象，把「对一万条数据做运算」变成一句话
last_verified: 2026-08-22
---

> [!abstract] 本课将学到
>
> - **NumPy**（Numerical Python 的缩写，读作「南派」）为什么是整个 AI 大厦的地基
> - **数组（ndarray）**：会自己算数的表格——P6 的「对象」第一次派上大用场
> - **广播（Broadcasting）**与**向量化（Vectorization）**：不用写循环的秘密武器
> - 亲手玩：纯 Python 循环 vs NumPy 的速度对决

## 生活场景切入

老板给你一份 Excel：一万名员工的成绩。任务：每个人的分数乘 1.2 再加 5 分。

用 P4 学的循环写：

```python
result = []
for s in raw_scores:          # 一万行数据就转一万圈
    result.append(s * 1.2 + 5)
```

能用，但啰嗦。用 Excel 的人都知道更爽的做法：**选中整列、拖一下右下角**——整列同时变。

NumPy 就是 Python 里的这个动作：

```python
import numpy as np

scores = np.array([88, 92, 75, 60, 95])   # 装进数组
result = scores * 1.2 + 5                 # 整列同时算！没有 for 循环
print(result)
# [110.6 115.4  95.   77.  119. ]
```

`scores * 1.2` 看起来像「数字 × 数字」，实际是「数组里每个元素都乘」。这种「一条式子管全部数据」的风格叫**向量化（Vectorization）**——它是 NumPy 又快又好读的原因，也是所有 AI 框架的通用语感。

## 核心概念拆解

### 概念 1：ndarray —— 会算数的表格

`np.array(...)` 造出来的东西叫 **ndarray**（N-dimensional array，N 维数组）。它是 P6 讲过的对象，而且出厂自带一大排方法：

```python
arr = np.array([88, 92, 75, 60, 95])

print(arr.mean())     # 82.0   ← 自带求平均
print(arr.max())      # 95     ← 最大值
print(arr.min())      # 60
print(arr.sum())      # 410    ← 求和
print(arr.std())      # 标准差（衡量波动大小）
```

对比 P5 自己写的 `average(nums)`：功能一样，但现在这些统计动作**出厂就有**。数组的维度可以往上叠：

```python
a = np.array([1, 2, 3])            # 1 维：一列数 → 向量
m = np.array([[1, 2], [3, 4]])     # 2 维：表格 → 矩阵
print(m.shape)                     # (2, 2) ← 形状：2 行 2 列
```

记住两个词：**shape（形状）**描述几行几列，**vector / matrix（向量/矩阵）**是一维/二维数组的数学名字。深度学习的数据全程以这两种形态流动。

### 概念 2：向量化 = 把循环交给 C 语言

NumPy 为什么快？因为 `scores * 1.2` 这句话背后，真正的循环在 **C 语言写的底层代码**里跑——编译好的机器码，比 Python 循环快几十到上百倍。

```python
import numpy as np
import time

n = 10_000_000                    # 一千万个数
big = np.arange(n)                # 0 到 n-1 的数组

t0 = time.time()
py_list = [x * 2 for x in range(n)]        # 纯 Python 写法
t1 = time.time()

np_result = big * 2                          # NumPy 写法
t2 = time.time()

print(f"Python 列表推导: {t1-t0:.3f} 秒")
print(f"NumPy 向量化:  {t2-t1:.4f} 秒")
```

在本站验证环境（Python 3.13 + NumPy 2.x）实测，同样一千万个数的翻倍运算，NumPy 用时约是纯 Python 的 **1/20**——数据量越大、运算越复杂，差距还会拉大。训练神经网络要对百万级参数反复做乘加，没有这种速度，一次训练要等几年——这就是「AI 必须用 NumPy 思维」的根本原因。

### 概念 3：广播 —— 不同形状也能算

形状不同的数组相遇时，NumPy 会自动「补齐矮的那个」，这叫**广播（Broadcasting）**：

```python
prices = np.array([30, 25, 40])       # 3 种水果的价格
cart1 = np.array([1, 2, 0])           # 第 1 位顾客买了几样
cart2 = np.array([0, 1, 3])           # 第 2 位顾客

carts = np.array([[1, 2, 0],
                  [0, 1, 3]])         # 2×3 表格：两位顾客的购物车

total = carts @ prices                # 矩阵乘法：每位顾客该付多少钱
print(total)                          # [ 80 145]
```

`carts @ prices` 是矩阵乘法（2×3 乘 3×1 得到 2×1）。看不懂计算细节没关系——M8《向量与矩阵》会专门讲。现在只需要建立体感：**表格和表格可以直接做代数运算**，这正是「线性层 = 输入矩阵 @ 权重矩阵」在深度学习里到处出现的样子。

### 概念 4：随机数 —— 模拟世界的入口

```python
rng = np.random.default_rng(seed=42)      # 随机数生成器（固定种子=可复现）
dice = rng.integers(1, 7, size=10)        # 掷 10 次骰子
heights = rng.normal(170, 8, size=1000)   # 1000 个「身高」（正态分布）

print(heights.mean().round(2))            # 约 170 —— 大数定律！
```

最后一行值得玩味：每个随机身高都不确定，但 1000 个的平均值稳稳落在 170 附近。**机器学习的训练数据、初始化权重、dropout 全靠随机数驱动**；而固定 `seed` 让实验可复现——这是科研代码的基本礼仪（宪章精神：结果可追溯）。

## 交互演示：速度竞技场

<iframe src="/static/widgets/py-numpy-arena.html" class="widget-frame" style="height:520px"></iframe>

试着这样玩：

1. 从 1 千拉到 1 百万，分别点「开赛」——观察两种写法的耗时差距如何越拉越大
2. 数据量翻 10 倍时，两条柱子的增长趋势一样吗？（Python 接近线性增长，NumPy 几乎平的）
3. 读读右侧的代码对照区：两段代码干的是同一件事
4. 思考：如果训练模型每秒要做几千次这样的运算，选哪种写法？

> [!note] 关于演示里的计时
> 你的浏览器和电脑性能不同，绝对数字会不一样，但「差距随数据量扩大」的规律在任何设备上都成立。真实 NumPy 在本机 Python 上比浏览器演示还要快得多。

## 本章英文小词典

| 英文            | 中文      | 一句话记忆                                        |
| --------------- | --------- | ------------------------------------------------- |
| NumPy           | （南派）  | Numerical Python，数值计算的基石库                |
| Array / ndarray | 数组      | N 维数组对象，AI 数据的标准容器                   |
| Vector / Matrix | 向量/矩阵 | 一维/二维数组的数学称呼                           |
| Shape           | 形状      | `(行数, 列数)`，调试 AI 代码第一眼就看它          |
| Vectorization   | 向量化    | 用整体运算代替手写循环                            |
| Broadcasting    | 广播      | 不同形状自动对齐的机制                            |
| Element-wise    | 逐元素的  | 对应位置各自运算                                  |
| Random Seed     | 随机种子  | 固定它 = 实验可复现                               |
| Import          | 导入      | `import numpy as np`——as 后面是社区约定俗成的昵称 |

## Code Lab：亲手运行

下面的实验会真实执行代码，内容和完成状态只保存在当前浏览器。先运行默认代码，再按本课任务修改。

<iframe src="/static/labs/lab#python-numpy" class="widget-frame code-lab-frame" style="height:520px" title="NumPy：数字的瑞士军刀 NumPy Essentials Code Lab"></iframe>

### 分步任务

1. 运行默认代码并解释输入、处理和输出。
2. 修改一个值或条件，预测结果后再次运行。
3. 完成本课挑战，直到自动检查通过。

## 自测一下

> [!question]- 1. `np.array([2, 4, 6]) * 2` 和 `[2, 4, 6] * 2`（普通列表）结果有什么不同？
> 前者是 NumPy：逐元素翻倍 → `[4, 8, 12]`。后者是 Python 列表：`*` 表示重复 → `[2, 4, 6, 2, 4, 6]`。同名操作在两种容器上行为完全不同——所以看到别人代码先确认手里是 list 还是 ndarray。这也是为什么 AI 代码几乎都在开头 `import numpy as np`，然后尽快把数据转成数组。

> [!question]- 2. `(arr > 80)` 返回什么？`(arr[arr > 80])` 又返回什么？
> 前者返回布尔数组，如 `[True True False False True]`——每个位置的判断结果。后者是「布尔索引」：只挑出 True 位置的元素 → `[92, 95]`。「条件当面具用」是数据筛选的核心技巧，Pandas 里 `df[df["age"] > 18]` 完全是同一个套路。

> [!question]- 3. 为什么说「向量化不只是快，还更不容易错」？
> 手写循环要自己管理下标、边界、累加器，每一处都可能 off-by-one（差一错误）；向量化把循环交给经过千锤百炼的底层实现，你只需表达「做什么」而非「怎么逐步做」。代码短了、意图清楚了，bug 的藏身之处自然少了。工程经验：当你发现自己在 NumPy 代码里写 for 循环，九成情况都有更快的向量写法。

> [!question]- 4. 固定随机种子 `seed=42` 有什么用？不固定会怎样？
> 种子决定随机序列：同样种子每次运行产生完全相同的「随机」数，实验结果可复现、可对比、可 debug。不固定的话，每次跑模型初始化不同、数据打乱顺序不同——今天 95% 明天 93%，你说不清是改动有效还是运气变了。论文要求附随机种子，就是为了让别人能复现你的结果（宪章第三十五章：可追溯）。

## 下一步

- [[prerequisites/python/pandas|P8 · Pandas：像 Excel 一样处理表格]]——NumPy 管数字，Pandas 管带名字标签的表格数据
- 数学补给：[[prerequisites/math/index|M8 · 向量与矩阵]]——想搞懂 `@` 到底算了什么，去那里

→ 返回 [[prerequisites/python/index|🐍 Python 目录]]
