---
title: 易混词对辨析（一） Confusable Pairs I
description: model/module、parameter/hyperparameter、feature/characteristic、accuracy/precision——AI 圈最容易写错的四组词
last_verified: 2026-08-23
---

> [!abstract] 本课将学到
>
> - 四组高频易混词的**精确含义边界**与搭配习惯
> - 每组的「真实翻车案例」——混淆它们会闹出什么笑话或事故
> - 记忆锚点：一个钩子记住一组，永不再混

## 生活场景切入

把「我调了模型的 parameters」写成「我调了模型的 modules」，懂行的同事会愣一下——前者是调参，后者是换零件。AI 术语里有一批「长得像、译名近、但含义差之千里」的词对，它们是英文技术写作中最常见的翻车点。

本课一次解决四组最高频的。判断标准很简单：**这四个词对在论文、文档、代码注释里的出错率最高**。

## 词对 1：model vs module

| 词         | 含义                            | 典型搭配                                               |
| ---------- | ------------------------------- | ------------------------------------------------------ |
| **model**  | 模型：学出来的那套参数+结构整体 | train a model / deploy the model / model size          |
| **module** | 模块：代码/网络的组成单元       | import a module / nn.Linear module / a reusable module |

**辨析钩子**：model 是「大脑」，module 是「器官」。PyTorch 里所有网络组件都继承自 `nn.Module`——但整个网络训练完成后叫 `model`。

```python
import torch.nn as nn

class MyNet(nn.Module):        # ← 继承「模块」基类（零件）
    def __init__(self):
        super().__init__()
        self.layer = nn.Linear(10, 2)

model = MyNet()                # ← 实例化后叫「模型」（整体大脑）
```

**翻车现场**：简历写「优化了模型的 modules」→ 面试官理解成你改了库源码；实际想说的是调参。

## 词对 2：parameter vs hyperparameter

| 词                 | 含义                           | 谁来定               |
| ------------------ | ------------------------------ | -------------------- |
| **parameter**      | 参数：模型训练中自己学出来的数 | 模型自己（梯度下降） |
| **hyperparameter** | 超参数：训练前人工拍板的设定   | 你（人工）           |

**辨析钩子**：hyper- = 「在……之上」——超参数是**凌驾于训练过程之上**的设定。学习率 η、batch size、层数都是 hyperparameter；权重 w、偏置 b 都是 parameter。M7 的 `w ← w − η∇L` 一行式里两种都有：w 是 parameter，η 是 hyperparameter。

**真实语境**：「tuning」单独出现通常指调 hyperparameter（ML9 的交叉验证就是干这个）；「the learned parameters」指训练产物。

## 词对 3：feature vs characteristic

| 词                 | 含义                                       | 使用域        |
| ------------------ | ------------------------------------------ | ------------- |
| **feature**        | 特征：喂给模型的输入变量（可量化、有列名） | 机器学习专属  |
| **characteristic** | 特性：事物的一般性质描述                   | 日常/学术泛指 |

**辨析钩子**：进了 DataFrame 的才叫 feature。房子的「朝南、采光好」是 characteristics；表格里的 `area=89, rooms=3, age=5` 才是 features。ML8 特征工程的全程只谈 feature。

**翻车现场**：论文里写 "the characteristics of the input layer" → 审稿人会以为是笔误，应为 features。

## 词对 4：accuracy vs precision

日常英语里两者都译作「准确」，但在 ML 里它们是**两个不同的指标**（ML9 的老朋友）：

| 词            | ML 含义                      | 公式         |
| ------------- | ---------------------------- | ------------ |
| **accuracy**  | 准确率：全部预测中判对的比例 | (TP+TN)/全部 |
| **precision** | 精确率：报警的里面真有几只狼 | TP/(TP+FP)   |

**辨析钩子**：accuracy 管「总体对不对」，precision 管「报『是』时靠不靠谱」。类别不平衡时 accuracy 会说谎（99% 全判负的模型），此时只能看 precision/recall。

**延伸**：`precise` 与 `accurate` 在日常语里也有此分野——precise 是「每次都打同一个点」（稳定），accurate 是「打到靶心」（正确）。仪器可以 precise 但不准确（系统性偏差），这正是 M10 均值/偏差话题的语言版。

## 本章英文小词典

| 英文           | 中文   | 一句话记忆               |
| -------------- | ------ | ------------------------ |
| Model          | 模型   | 大脑整体                 |
| Module         | 模块   | 可复用零件               |
| Parameter      | 参数   | 训练学出来的旋钮         |
| Hyperparameter | 超参数 | 凌驾于训练之上的人工设定 |
| Feature        | 特征   | 进表的可量化输入         |
| Characteristic | 特性   | 泛指的性质描述           |
| Accuracy       | 准确率 | 总体判对比例             |
| Precision      | 精确率 | 报警的浓度               |

## 自测一下

> [!question]- 1. 选词填空：「The trained \_**\_ contains 1.2 million \_\_** and was configured with three \_\_\_\_ .」
> The trained **model** contains 1.2 million **parameters** and was configured with three **hyperparameters**.
> 三个空分别对应「整体大脑 / 学出的旋钮 / 人工设定的配置」——一句话里三词同框是最常见的真实句型。

> [!question]- 2. 为什么说「precision 高的模型不一定 accurate」？构造一个数值例子。
> 极端例子：1000 个样本只有 10 个正类。模型只报了 1 个正类且报对了：precision = 1/(1+0) = 100%，但漏掉了 9 个正类。
> 此时 accuracy = (1+989)/1000 = 99% 也高——但 recall 只有 1/10。这说明 precision/accuracy 各自都可能「局部好看」，必须组合看（这正是 ML9 强调多指标的原因）。

> [!question]- 3. PyTorch 文档说 "All networks are subclasses of nn.Module"——为什么不说 nn.Model？
> 因为框架设计视角里，网络是由**可复用组件（模块）拼装**而成的：Linear、Conv2d、Dropout 都是 module，你自己定义的网络也只是「更大的 module」。拼装完成后作为整体去 train/save/deploy 时，才升格称为 model。
> 命名反映设计哲学：**module 强调组合性，model 强调整体性**。

> [!question]- 4. 「特征工程」为什么翻译成 feature engineering 而不是 characteristic engineering？
> 因为被加工的对象是**数据表中的具体列**——可计算、可变换、有类型。characteristic 描述的是不可量化的抽象性质（「这个人体质好」），无法进入矩阵运算。
> 语言证据：sklearn/pandas 的 API 全部围绕 features（`n_features_in_`、`feature_names`）；从不见 characteristic 出现在代码里。**API 用词就是术语边界的最终裁判**。

## 下一步

- [[english/terms-confusable-2|T2 · 易混词对辨析（二）]]——train/training/trainer 与 inference/predict
- 相关课程：[[prerequisites/math/statistics|M10]]（accuracy/precision 的数学细节）

→ 返回 [[english/ai-terms/index|🤖 AI 术语深挖目录]]
