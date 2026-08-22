---
title: 函数：把重复的事打包 Functions
description: 写一次、到处用——函数是代码的乐高积木，也是读懂一切 AI 框架的钥匙
last_verified: 2026-08-22
---

> [!abstract] 本课将学到
>
> - **函数（Function）**：给一段常用代码起个名字，随时喊它干活
> - **参数（Parameter）**与**返回值（Return Value）**：函数的「进料口」和「出料口」
> - 为什么说 PyTorch 的一切「都是函数」——这是通往深度学习的最后一层窗户纸
> - 亲手玩：函数机器装配台，看输入怎么变成输出

## 生活场景切入

家里来客人要泡茶。你不会每次都从头想：「烧水几度？茶叶放多少？泡几分钟？」——第一次琢磨清楚后，这套流程就成了你的**招牌动作**，之后喊一声「泡茶」就能自动完成。

函数就是编程里的招牌动作：

```python
def make_tea(water, leaves):
    """用 water 毫升水和 leaves 克茶叶泡一杯茶"""
    tea = water * 0.01 + leaves * 2     # 泡茶的神秘公式
    return tea                          # 把成品递出去

cup1 = make_tea(200, 3)      # 喊一声：200 毫升水、3 克茶叶
cup2 = make_tea(300, 5)      # 再喊一声，参数不同、流程不变
```

写一遍，用无数次。而且因为逻辑集中在一处，想改配方只改一个地方。

## 核心概念拆解

### 概念 1：解剖一个函数

```python
def greet(name):              # ← def 定义 + 名字 + 参数表 + 冒号
    text = "你好, " + name    # ← 函数体（缩进的部分）
    return text               # ← return 把结果交还给调用者

msg = greet("小明")           # ← 调用：name 接住 "小明"
print(msg)                    # 你好, 小明
```

四样东西各就各位：

| 部件         | 例子             | 类比                     |
| ------------ | ---------------- | ------------------------ |
| `def` + 名字 | `def greet`      | 给机器挂个牌子           |
| **参数 Parameter** | `name`     | 进料口（要什么原料）     |
| 函数体       | 缩进的两行       | 内部加工流程             |
| **返回值 Return value** | `return text` | 出料口（交付什么成品） |

### 概念 2：return 是唯一的出口

函数跑完可以不返回任何东西（比如单纯打印），但只要写了 `return`，就代表「加工完毕，交货」：

```python
def average(nums):
    return sum(nums) / len(nums)

avg = average([88, 92, 75])
print(avg)          # 85.0
```

这个 `average()` 三行就封装了上节课的统计逻辑——以后任何成绩单都能一行调用。**标准库里成千上万的现成函数（len、sum、print…）就是这么打包好等你用的**。你从今天起写的每个函数，都是在给自己攒私人工具箱。

> [!tip] print 和 return 的区别（高频困惑）
> `print` 只是「显示给你看」，显示完就没了；`return` 才是「把结果真正交出来」，能存进变量继续用。只 print 不 return 的函数像个表演者——观众看到了，但后台什么都没留下。

### 概念 3：AI 框架 = 一大箱现成函数

看一段真实的 PyTorch 训练代码（下下个板块你就会自己写）：

```python
output = model(images)          # 调用 model 这个「可调用对象」算预测
loss = loss_fn(output, labels)  # 用损失函数打分
optimizer.step()                # 让优化器走一步梯度下降
```

每一行都在**调用别人写好的函数**：模型本身是一台大函数机器（输入图片 → 输出概率），训练循环是函数的反复调用。「会调函数」和「会写函数」加起来，你就拥有了使用一切 AI 框架的基本功。

### 概念 4：作用域——函数的小房间

函数体内部创建的变量是「本地户口」，出了函数就消失：

```python
def calc():
    temp = 99          # 只活在这个小房间里
    return temp * 2

result = calc()        # result = 198
# print(temp)         # ❌ NameError！temp 已经不在了
```

这不是麻烦而是保护：函数内部的临时变量绝不会污染外面的世界，你可以放心地到处调用而不用担心撞名。

## 交互演示：函数机器装配台

<iframe src="/static/widgets/py-func-machine.html" class="widget-frame" style="height:540px"></iframe>

试着这样玩：

1. 选一台预置机器（如 `average`），拖动输入滑块，观察输出实时变化——**参数决定输出**
2. 点开「机器内部」看它的函数体，对照输入输出理解每行的作用
3. 玩「黑箱挑战」：不给看内部，只靠喂几个输入猜出这台机器干什么——这就是读文档时面对陌生 API 的真实体验
4. 思考：同一台机器喂同样的输入，输出永远一样吗？（纯函数的可复现性——科学计算的地基）

## 本章英文小词典

| 英文                  | 中文       | 一句话记忆                                        |
| --------------------- | ---------- | ------------------------------------------------- |
| Function / Define     | 函数 / 定义 | def 是 define 的缩写                             |
| Parameter / Argument  | 形参/实参   | parameter 占位名单，argument 实际递来的东西      |
| Return value          | 返回值      | 函数交回来的成品                                 |
| Call / Invoke         | 调用        | 喊函数的名字让它干活                             |
| Scope                 | 作用域      | 变量的有效范围                                   |
| Built-in function     | 内置函数    | Python 自带工具（print、len、sum…）              |
| Library / Module      | 库 / 模块   | 别人打包好的函数仓库（import 来取用）            |
| Reusable              | 可复用的    | 写一次到处用——函数存在的全部理由                 |

## 自测一下

> [!question]- 1. 下面这段代码输出什么？
>
> ```python
> def double(x):
>     x * 2        # 注意这行没有 return
>
> y = double(5)
> print(y)
> ```
>
> 输出 **None**。没有 `return` 的函数默认返回 None（表示「什么都没有」）。函数体里的 `x * 2` 算了但白算——结果没交出去就丢了。这是新手最常见的静默 bug：程序不报错，但拿到手的永远是 None。看到自己的变量变成 None，第一反应就该是「哪个函数忘了 return」。

> [!question]- 2. `def f(a, b=10)` 这种写法是什么意思？`f(3)` 和 `f(3, 1)` 分别算出什么？
> `b=10` 是**默认参数**：调用时不给 b 就自动用 10。所以 `f(3)` 相当于 `f(3, 10)`，`f(3, 1)` 则显式把 b 设为 1。默认参数让函数「开箱即用又保留调节空间」——你在 PyTorch 里看到的 `torch.zeros(2, 3, dtype=float64)` 尾巴上那一串，全是这种设计。

> [!question]- 3. 为什么说「函数是通往深度学习框架的钥匙」？用本课概念拆解 `loss = loss_fn(output, labels)`。
> 这行就是标准的函数调用：`loss_fn` 是函数名，`output` 和 `labels` 是两个实参（argument），函数返回值被赋给变量 `loss`。框架作者把「如何计算误差」这件复杂的事打包成一个名字，使用者不需要懂内部实现也能正确使用——这正是函数「封装复杂度」的价值。整个 PyTorch 就是几百个这样的函数（和它们的组合）。

> [!question]- 4. 上节课求平均分用了 `sum(scores) / len(scores)`，现在把它封装成函数并处理一种边界情况。
>
> ```python
> def average(nums):
>     if len(nums) == 0:        # 空列表除以零会崩
>         return 0
>     return sum(nums) / len(nums)
> ```
>
> 加的那三行是**防御性检查**：空列表会让除法报 ZeroDivisionError。写函数时多问一句「喂给我的东西可能有什么意外」，是从「能跑的代码」到「可靠的代码」的分水岭——也是审查 AI 生成的代码时最该盯的地方。

## 下一步

- [[prerequisites/python/classes|P6 · 类与对象初识]]——函数管「动作」，类把数据和动作打包成「东西」
- 强迫症福利：回头看看 [[prerequisites/python/control-flow|P4]] 的演示器里那些重复的统计代码，想想哪些值得抽成函数

→ 返回 [[prerequisites/python/index|🐍 Python 目录]]
