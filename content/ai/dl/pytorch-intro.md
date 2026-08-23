---
title: PyTorch 初体验 PyTorch First Steps
description: 把手写的 40 行反向传播交给四行 API——张量、自动求导与训练循环的工业标准姿势
last_verified: 2026-08-23
---

> [!abstract] 本课将学到
>
> - **PyTorch** 是什么、为什么成了深度学习的事实标准之一
> - **张量（Tensor）**：M8 向量矩阵的 GPU 加速版
> - **自动求导（Autograd）**：`loss.backward()` 背后就是你 DL2 手写的链式法则
> - 标准训练循环五件套，逐行对应你已有的知识
> - 本课代码在本地 CPU 环境实测通过，无需 GPU

## 生活场景切入

DL2 你徒手写了 40 行才训出一个 XOR。真实网络有上亿参数——手写梯度既不可能也没必要。

PyTorch 的角色一句话概括：

> **你负责搭网络的前向结构（数据怎么流），求导和更新它全包了。**

这就像从「手搓每个齿轮」进入「有电动工具的时代」——造的还是同一种机器（DL1/DL2 的原理一点没变），但速度是天壤之别。Facebook 2016 年发布 PyTorch 后，学术界几乎清一色倒戈；OpenAI 的 GPT 系列、Meta 的 LLaMA 的官方实现都是 PyTorch 写的。

## 核心概念拆解

### 概念 1：张量 —— 会记仇的多维数组

```python
import torch          # torch 2.x，本课示例在 CPU 上实测

x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
print(x.shape)        # torch.Size([2, 2]) —— M8 的「形状」概念
print(x @ x)          # 矩阵乘法，语法与 NumPy 几乎一致
```

张量（Tensor）就是 NumPy 数组的高配版，两超能力：

1. **GPU 加速**：`.to("cuda")` 一句话搬进显卡，矩阵运算快几十上百倍
2. **自动记账**：只要张量带 `requires_grad=True`，对它参与的每一步运算，autograd 都会默默记录在一张「计算图」上——之后 `backward()` 一声令下，所有参数的梯度按 DL2 的规则倒着算好

### 概念 2：自动求导 —— 你的手推被自动化了

用 DL2 同款最小网络验证（实际运行结果）：

```python
import torch, math

W1 = torch.tensor([0.5, -0.3], requires_grad=True)
b1 = torch.tensor([0.1, 0.2])
W2 = torch.tensor([0.8, -0.6], requires_grad=True)
b2 = torch.tensor(0.05)
x, t = torch.tensor(1.5), torch.tensor(1.0)

# 前向传播：就是普通 Python 运算
h = torch.sigmoid(W1*x + b1)
o = torch.sigmoid((W2*h).sum() + b2)
loss = (o - t)**2
print(f"loss = {loss.item():.4f}")     # loss = 0.1713 —— 与 DL2 手算一致！

loss.backward()                        # 反向传播一行搞定
print(f"dW2 = {W2.grad.tolist()}")     # [-0.1406946..., -0.08792793...]
print(f"dW1 = {W1.grad.tolist()}")     # [-0.05055428..., 0.04448795...]
```

对照 DL2 的手工结果：**逐位一致**。你花一整课理解的链式法则分摊责任，框架里是 `.backward()` 一个词。区别只在于：现在计算图由 autograd 自动构建，你再也不用手推公式、也不会再犯漏乘 x 那种错了。

> [!tip] grad 为什么不会自己累加出错？
> PyTorch 的梯度默认**累加**到 `.grad` 上（方便某些高级用法），所以每次迭代前要 `optimizer.zero_grad()` 清零。新手十大坑之首——忘清零会让梯度越滚越大，模型行为诡异。

### 概念 3：nn.Module —— 用积木搭网络

```python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(2, 4),      # 全连接层：W(4×2)+b —— DL1 的神经元阵列
    nn.Sigmoid(),
    nn.Linear(4, 1),
    nn.Sigmoid(),
)
print(model)
# Sequential(
#   (0): Linear(in_features=2, out_features=4, bias=True)
#   ...
# )
```

`nn.Linear(2, 4)` 就是「64 个权重 + 4 个偏置」的封装——DL2 里 `W1, b1` 的工业化版本。常用积木速查：

| 积木                    | 对应你已经学过的     |
| ----------------------- | -------------------- |
| `nn.Linear`             | 全连接层（DL1/DL2）  |
| `nn.ReLU / Sigmoid`     | 激活函数三兄弟       |
| `nn.Conv2d`             | 卷积层（DL5 见）     |
| `nn.LSTM / Transformer` | 序列模型（DL7/9 见） |

### 概念 4：标准训练循环 —— 五件套对号入座

```python
optimizer = torch.optim.SGD(model.parameters(), lr=1.5)
criterion = nn.BCELoss()                      # 二分类交叉熵

X = torch.tensor([[0.,0.],[0.,1.],[1.,0.],[1.,1.]])
Y = torch.tensor([[0.],[1.],[1.],[0.]])

for epoch in range(20000):
    pred = model(X)                  # ① 前向传播
    loss = criterion(pred, Y)        # ② 算损失
    optimizer.zero_grad()            # ③ 清空旧梯度（别忘！）
    loss.backward()                  # ④ 反向传播（autograd 干活）
    optimizer.step()                 # ⑤ 更新参数（梯度下降）

with torch.no_grad():
    print(model(X).round().flatten().tolist())   # [0.0, 1.0, 1.0, 0.0] ✓
```

五行注释就是 DL2 的伪代码骨架原封不动地落地。`BCELoss` 是 ML3 交叉熵的二分类版；`SGD` 是 M7 的老朋友（换 Adam 只改一个词）。**框架没有引入任何新思想，只是把你的知识装进了流水线。**

### 概念 5：环境与学习资源

```bash
pip install torch        # CPU 版即可开始学习；GPU 版安装见官网选择器
```

本站配套：P 板块装好的环境直接 `pip install torch` 即可（Python 3.13 + torch 2.x 实测可用）。GPU 不是学习的必需品——本课示例全部 CPU 秒出。等 DL6 训真图像时再考虑 Colab 免费显卡或本地 GPU。

## 本章英文小词典

| 英文                | 中文     | 一句话记忆                        |
| ------------------- | -------- | --------------------------------- |
| PyTorch             | —        | 动态图深度学习框架（Meta 出品）   |
| Tensor              | 张量     | 多维数组 + GPU 加速 + 自动求导    |
| Autograd            | 自动求导 | 计算图自动构建，backward 一键反传 |
| Computational graph | 计算图   | 记录运算依赖的有向图              |
| nn.Module           | 网络模块 | 所有网络组件的基类/积木           |
| Optimizer           | 优化器   | 管理参数更新的管家（SGD/Adam…）   |
| Criterion / Loss    | 损失函数 | 打分器                            |
| zero_grad()         | 清零梯度 | 忘了它会喜提新手第一大坑          |
| no_grad()           | 关闭求导 | 推理时省内存提速                  |
| CUDA                | —        | NVIDIA 的 GPU 并行计算平台        |

## 自测一下

> [!question]- 1. `loss.backward()` 之后为什么必须 `optimizer.zero_grad()`？不清理会发生什么？
> PyTorch 的设计里 `.grad` 是**累加**语义：连续两次 backward，第二次的梯度会叠在第一次上面。
> 若忘清零，每步更新用的是「历史所有批次梯度的总和」，等效于学习率随时间疯狂增大——损失先震荡后爆炸成 nan。
> （累加语义并非缺陷：梯度累积技巧正是靠它在小显存上模拟大 batch。框架只是把选择权留给了你。）

> [!question]- 2. `with torch.no_grad():` 包住预测代码的目的是什么？
> 推理时不需要梯度。no_grad 让框架跳过计算图记录，省下大量内存并加速。
> 若不加，测试代码也会建图占内存（还可能意外触发 backward 报错）。经验法则：**训练循环外的一切前向计算都套 no_grad**。

> [!question]- 3. 把 DL2 手写的 XOR 网络改成 PyTorch 时，「lr=1.5」应该写在哪里？
> 写在优化器里：`torch.optim.SGD(model.parameters(), lr=1.5)`。
> 学习率属于**超参数**（ML9 的纪律：用验证集+交叉验证调它），不属于模型结构。注意它和 `nn.Linear` 的参数是两类东西——后者由模型持有并被优化器统一管理，前者只是优化器的配置项。

> [!question]- 4. 为什么说「理解了 DL1/DL2 就等于理解了 PyTorch 的全部核心」？框架还剩什么没替你做？
> 因为框架的核心魔法只有两件事：① 张量并行运算（NumPy 的 GPU 版）；② autograd 自动执行你手推过的链式法则。训练循环的五件套一一对应 DL2 伪代码的五个动作——思想层面零新增。
> 框架没替你做的恰恰是最难的部分：**设计网络结构、选损失函数、调超参数、诊断过拟合**——这些是 ML4/ML8/ML9 和后续课程的内容。工具解决体力活，判断力仍是人的核心竞争力。

## 下一步

- [[ai/dl/fcn-practice|DL4 · 全连接网络实战]]——用 PyTorch 完整训练一个月牙形数据的分类器
- 环境报错？回 [[prerequisites/python/install-python|P1]] 或 [[prerequisites/python/numpy|P7]] 补基础

→ 返回 [[ai/dl/index|🧠 深度学习目录]]
