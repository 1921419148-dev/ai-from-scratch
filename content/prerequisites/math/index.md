---
title: 数学基础
description: 从加减乘除补到微积分——AI 需要的全部数学，零基础友好版
last_verified: 2026-08-22
---

> [!abstract] 本板块解决
> 一提到 AI 就绕不开数学，但别慌：**AI 用到的数学没有想象中可怕**，而且每一块都有明确的用途。我们从小学水平的四则运算讲起，一路补到训练神经网络必需的微积分、线性代数和概率统计。

## 学习顺序

| #   | 课程                                                                    | 学它干什么用           | 状态 |
| --- | ----------------------------------------------------------------------- | ---------------------- | ---- |
| M1  | [[prerequisites/math/numbers-and-expressions\|数与式：从加减乘除说起]]  | 一切的地基             | ✅   |
| M2  | [[prerequisites/math/equations-and-inqualities\|方程与不等式]]          | 「求解」的思想         | ✅   |
| M3  | [[prerequisites/math/functions\|函数：机器之间的对应关系]]              | 理解「模型就是函数」   | ✅   |
| M4  | [[prerequisites/math/exponents-and-logarithms\|指数与对数：增长的数学]] | 学习率衰减、信息熵     | ✅   |
| M5  | [[prerequisites/math/trigonometry\|三角函数初步]]                       | 旋转、周期信号、词向量 | ✅   |
| M6  | [[prerequisites/math/derivatives\|导数：变化的速度]]                    | 梯度下降的前提         | ✅   |
| M7  | [[prerequisites/math/gradient-descent\|梯度下降：AI 训练的核心引擎]]    | **全课程最重要的一课** | ✅   |
| M8  | [[prerequisites/math/vectors-and-matrices\|向量与矩阵：数据的语言]]     | 数据在电脑里的样子     | ✅   |
| M9  | [[prerequisites/math/probability\|概率：不确定性的度量]]                | 分类、生成模型         | ✅   |
| M10 | [[prerequisites/math/statistics\|统计初步：从样本猜整体]]               | 评估指标的理解         | ✅   |

> [!tip] 数学恐惧症患者专用建议
>
> - 不必按顺序全学！学到 **M7（梯度下降）** 就可以跳去机器学习，边用边回来补
> - 每课都有生活化类比 + 交互演示，公式恐惧症有救
> - 卡住了就休息，「暂时不懂」是学习的一部分，不是失败

→ 配套资源与 24 周自学计划见 [[prerequisites/math/resources-and-plan|数学学习资源与 24 周计划]]（Khan / Paul's Notes / 3Blue1Brown / 武忠祥等 22 个资源评估）。

→ 相关：[[roadmap|🗺 路线图]] · [[prerequisites/python/index|🐍 Python 目录]] · 已学完导数？去 [[ai/nn/3blue1brown/index|🎬 3Blue1Brown 神经网络伴学指南]]（已移至「人工智能 → 神经网络」板块）

## 板块内直达

- [[prerequisites/math/gradient-descent|M7 梯度下降]] 内嵌 3B1B 学习率下山交互演示
- 全部课程代码示例均在 Python 3.13 实测通过，学过 [[prerequisites/python/index|P 板块]] 的读者可亲手复跑
