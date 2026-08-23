---
title: 公式速查卡 Formula Cheat Sheet
description: 全站核心公式的集中速查——每个都配「人话翻译」与「在哪里学的」双链接，考前/写代码前扫一眼
last_verified: 2026-08-23
---

> [!abstract] 用法说明
> 按 Ctrl+F 搜关键词。每条公式三件套：**公式 → 人话翻译 → 出处链接**。符号约定：`x` 输入、`y` 真值、`ŷ` 预测、`w/b` 权重偏置、`L` 损失、`η` 学习率、`σ` sigmoid。

---

## 一、基础运算（M 板块）

### 幂的三条指数律

```text
aᵐ × aⁿ = aᵐ⁺ⁿ        aᵐ ÷ aⁿ = aᵐ⁻ⁿ        (aᵐ)ⁿ = aᵐˣⁿ
```

**人话**：同底相乘指数相加；相除相减；幂的幂相乘。
📍 [[prerequisites/math/numbers-and-expressions|M1 概念 4]]

### 平方差与完全平方

```text
(a + b)(a − b) = a² − b²                (a + b)² = a² + 2ab + b²
```

**人话**：一正一反括号相乘交叉项抵消；完全平方有三块，中间 2ab 别丢。
📍 [[prerequisites/math/numbers-and-expressions|M1 概念 5]]

### 一元二次求根公式

```text
x = (−b ± √(b² − 4ac)) / 2a          判别式 Δ = b² − 4ac
```

**人话**：Δ>0 两根、=0 重根、<0 无实根——曲线与横轴的两种两次穿越/一次擦边/不接触。
📍 [[prerequisites/math/equations-and-inqualities|M2 概念 2~3]]

### 对数三条律

```text
log(a×b) = log a + log b       log(a÷b) = log a − log b       log(aⁿ) = n·log a
```

**人话**：对数把乘法压成加法——交叉熵取 log 的数值安全理由。
📍 [[prerequisites/math/exponents-and-logarithms|M4 概念 3]]

### 信息熵

```text
H(p) = −Σ pᵢ·log₂ pᵢ           （均匀分布熵最大，必然事件熵为 0）
```

**实测参考**：公平硬币 H=1.0 bit；p=0.99 的偏斜硬币 H≈0.0808 bit。
📍 [[prerequisites/math/exponents-and-logarithms|M4 概念 5]]

### 三角函数与旋转

```text
单位圆上角度 θ 的点坐标：(cos θ, sin θ)
二维旋转：x′ = x·cosθ − y·sinθ    y′ = x·sinθ + y·cosθ
```

**人话**：Transformer 位置编码的原文数学（M5 的 sin/cos 在 DL9 正式上岗）。
📍 [[prerequisites/math/trigonometry|M5]]

---

## 二、微积分（M6）

### 导数的定义

```text
f′(x) = lim(h→0) [f(x+h) − f(x−h)] / 2h
```

**人话**：把两点间割线的斜率挤到同一点——瞬时变化率。数值版就是 DL2 的梯度检查器。

### 三条求导法则

```text
幂法则：  d/dx xⁿ = n·xⁿ⁻¹
乘积：    (u·v)′ = u′v + uv′
链式：    d/dx f(g(x)) = f′(g(x)) · g′(x)      ← 反向传播的心脏
```

**人话**：链式 = 外层导数 × 内层导数，齿轮传动逐级相乘。
📍 [[prerequisites/math/derivatives|M6 概念 2~4]]

### 常用函数导数表

| 函数            | 导数             | 备注                 |
| --------------- | ---------------- | -------------------- |
| `eˣ`            | `eˣ`             | 唯一导数是自己的函数 |
| `ln x`          | `1/x`            |                      |
| `sin x / cos x` | `cos x / −sin x` | 弧度制下才成立       |
| 常数 c          | 0                | 静止无变化率         |

---

## 三、线性代数（M8）

### 点积与余弦相似度

```text
a·b = Σ aᵢbᵢ                     cos_sim(a,b) = a·b / (‖a‖·‖b‖)
```

**人话**：对位相乘再全加。余弦相似度 =1 同向（语义相同）、0 垂直（无关）、−1 反向。
📍 [[prerequisites/math/vectors-and-matrices|M8 概念 2]] · 实战见 [[ai/nlp/word-embedding|NLP2]]

### 矩阵乘法

```text
C[i][j] = A 的第 i 行 · B 的第 j 列
形状规则：(m×n) @ (n×p) = (m×p)      中间必须相等！
```

**人话**：每一格都是一次点积；中间数字对不上就是 shape mismatch 报错榜第一名。
📍 [[prerequisites/math/vectors-and-matrices|M8 概念 3]]

---

## 四、概率统计（M9/M10）

### 贝叶斯定理

```text
              P(证据|真相) × P(真相)
P(真相|证据) = ──────────────────────
                    P(证据)
```

**实测参考**：患病率1%+灵敏度99%+误报5% → 阳性后真患病仅 ≈16.7%。
📍 [[prerequisites/math/probability|M9 概念 3]] · 文本版应用见 [[ai/nlp/text-classification|NLP3 朴素贝叶斯]]

### 期望与均值标准差

```text
E[X] = Σ xᵢ·P(xᵢ)               μ = Σxᵢ/n        σ = √(Σ(xᵢ−μ)²/n)
```

**人话**：期望是长期平均归宿；σ 是「罕见程度的汇率」（±2σ 内约 95%）。
📍 [[prerequisites/math/probability|M9 概念 4]] · [[prerequisites/math/statistics|M10 概念 2~3]]

---

## 五、机器学习核心公式（ML 板块）

### 线性回归与 MSE

```text
模型： ŷ = wx + b
损失： MSE = (1/n)·Σ(yᵢ − ŷᵢ)²
闭式解： w* = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)²         b* = ȳ − w*·x̄
```

**实测参考**：合成房价数据双路求解均得 w≈0.8189, b≈49.0180。
📍 [[ai/ml/linear-regression|ML2 概念 2~3]]

### Sigmoid 与逻辑回归

```text
σ(z) = 1/(1+e^(−z))              σ(0)=0.5，两端趋近 0/1
逻辑回归： p = σ(w₁x₁+w₂x₂+b)，p≥0.5 判正类
决策边界： wx+b = 0（一条直线）
```

📍 [[prerequisites/math/functions|M3 概念 5]] · [[ai/ml/logistic-regression|ML3]]

### 交叉熵损失

```text
二分类： L = −[y·log p + (1−y)·log(1−p)]
多类（softmax 后）： L = −log p_正确类
梯度彩蛋： softmax+CE 组合的梯度恰好 = p − y
```

**人话**：预测越自信地错，惩罚指数级加重（p=0.01 时 loss=4.6）。
📍 [[ai/ml/logistic-regression|ML3 概念 3]] · 多类版 [[ai/dl/image-classification|DL6 概念 2]]

### L2 正则化

```text
新损失 = 原损失 + λ·Σwᵢ²            （λ 是复杂度税率）
闭式解变形： θ = (XᵀX + λI)⁻¹Xᵀy     ← I 的首元素置 0 不罚截距
```

**实测参考**：10 次多项式过拟合 test=0.0313 → λ=0.001 时 test=0.0104。
📍 [[ai/ml/overfitting|ML4 概念 4]]

### 准确率/精确率/召回率/F1

```text
准确率   = (TP+TN)/全部
精确率 P = TP/(TP+FP)      「报警里真有几只狼」
召回率 R = TP/(TP+FN)      「所有狼抓回几只」
F1 = 2PR/(P+R)
AUC：ROC 曲线下面积，与阈值无关的排序能力度量
```

📍 [[prerequisites/math/statistics|M10 概念 5]] · [[ai/ml/model-evaluation|ML9 概念 2~4]]

---

## 六、深度学习核心公式（DL 板块）

### 神经元与前向传播

```text
单个神经元： a = σ(w·x + b)
整层并行：   h = ReLU(W₁x + b₁)      输出层： o = σ(W₂h + b₂)
```

**人话**：神经元=迷你逻辑回归；ReLU=max(0,x)。
📍 [[ai/dl/neuron|DL1 概念 1~2]]

### 反向传播误差信号

```text
输出层误差： δ_out = ∂L/∂o × σ′(...)
权重梯度：   ∂L/∂W₂ = δ_out × hᵀ        （流过的电流 × 上游闸门）
责任回传：   δ_hidden = (W₂ᵀδ_out) ⊙ σ′(pre_activation)
```

**人话**：责任倒着传，过一层乘一次局部导数。
📍 [[ai/dl/backpropagation|DL2 概念 2]] · 数值验证见其概念 3

### 缩放点积注意力 ★

```text
Attention(Q,K,V) = softmax(QKᵀ/√dₖ)·V

QKᵀ 打分 → ÷√dₖ 防饱和 → softmax 变配额 → 加权聚合 V
因果掩码： 未来位置分数置 −∞ → 权重精确归零
```

**实测参考**：三 token 手算权重行和恒为 1；掩码后 [0.269, 0.731, **0.0**]。
📍 [[ai/dl/attention|DL8 概念 1~4]]

### Transformer 参数量估算

```text
参数 ≈ 12 × 层数 × 维度²
验证： GPT-3 = 12 × 96 × 12288² ≈ 174B ≈ 官方 175B ✓
```

📍 [[ai/dl/transformer|DL9 概念 6]] · [[ai/dl/scaling-laws|DL11]]

### 扩散过程

```text
前向加噪： x_t = √(1−βₜ)·x_{t−1} + √βₜ·ε
反向生成： 从纯噪声出发逐步预测并减去噪声
```

**实测参考**：5 像素玩具图 10 步后信号保留系数降至 0.57。
📍 [[ai/genai/diffusion|G5 概念 1~2]]

---

## 七、强化学习核心公式（RL 板块）

### 贝尔曼方程

```text
V(s) = r + γ·V(s_next)
```

**人话**：「这里的价值」=马上拿的+打折后的后续价值。γ=0.9 时 20 步外奖励只剩 12% 权重。
📍 [[ai/rl/mdp|RL2 概念 4]]

### Q-Learning 更新 ★

```text
Q(s,a) ← Q(s,a) + α·[r + γ·max Q(s′,·) − Q(s,a)]
                              └── TD 目标 ──┘
```

**人话**：预期与现实差多少就修多少（α 控制步幅）。max 使其 off-policy。
📍 [[ai/rl/q-learning|RL3 概念 1]]

### 策略梯度（REINFORCE）

```text
∇J(θ) ≈ G × ∇log π(a|s,θ)
```

**人话**：整局回报好 → 放大这局所有动作的概率；坏 → 压小。
📍 [[ai/rl/policy-gradient|RL4 概念 2]]

### RLHF 目标函数（概念版）

```text
maximize  E[RM(回答)]  −  β·KL(π_新 ‖ π_SFT)
          ↑奖励模型打分    ↑别离原始模型太远（防作弊漂移）
```

📍 [[ai/rl/rlhf|RL6 概念 3]]

---

## 八、速算工具箱

| 场景            | 公式               | 记忆钩子              |
| --------------- | ------------------ | --------------------- |
| 学习率衰减      | lr(t)=lr₀·0.5ᵗ     | 每 t 轮减半           |
| 翻倍时间        | ln2/ln(1+r)        | 年化7%≈10年翻倍       |
| 样本量与精度    | 误差 ∝ 1/√n        | 减半精度要 4 倍样本   |
| 参数估算        | 12·L·d²            | GPT-3 复算 174B✓      |
| 训练 FLOPs      | 6·N·D              | GPT-3 ≈ 3.2e23        |
| Chinchilla 配比 | D ≈ 20N            | 70B 模型吃 1.4T token |
| 量化体积        | FP16 字节 × 精度比 | Q4 = ¼ 体积           |
| 串联成功率      | p₁·p₂·…·pₙ         | 0.95¹⁰≈0.60           |

→ 相关：[[appendix/glossary|📖 术语表]] · [[prerequisites/math/index|📐 数学目录]] · [[roadmap|🗺 路线图]]
