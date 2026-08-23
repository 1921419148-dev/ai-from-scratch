---
title: 易混词对辨析（二） Confusable Pairs II
description: train/training/trainer、inference/predict、epoch/iteration/batch——AI 日常口语里最容易说串的三组
last_verified: 2026-08-23
---

> [!abstract] 本课将学到
>
> - **train 家族**三个词性的分工与「trainer 是谁」的意外答案
> - **inference vs prediction**：一个语义细节里的行业分野
> - **epoch / iteration / batch / step**：训练日志里四个高频词的精确关系（附换算公式）
> - 口语场景演练：这些词在真实工作对话里怎么用

## 生活场景切入

新同事第一天上班，听到团队聊天：

> 「这个 model 的 **training** 跑了三天，**epoch** 设太大了。今晚跑完 **inference** 测一下，**batch size** 记得改回 64。」

每个词都认识，连起来却像密码。这一课把 AI 日常口语里最高频的三组词拆到母语者的使用精度。

## 词组 1：train / training / trainer

| 词                     | 词性    | 含义                             | 例句                                            |
| ---------------------- | ------- | -------------------------------- | ----------------------------------------------- |
| **train** (v.)         | 动词    | 训练这个动作                     | We train the model on 10M samples.              |
| **training** (n./adj.) | 名词/形 | 训练过程/阶段                    | training loss / training data / during training |
| **trainer** (n.)       | 名词    | ①训练器（代码封装）②训练师（人） | Hugging Face Trainer class                      |

**辨析钩子**：最意外的词是 trainer——在 AI 语境里它首先指**封装训练循环的代码对象**（Hugging Face 的 `Trainer` 类最著名），其次才是「训练师」这个人义。读文档时遇到 `trainer.train()` 要立刻切换到技术义。

**搭配习惯**：

```text
✅ in training / during training      （阶段）
✅ training set / training run       （复合名词）
⚠️ "I'm training a model" ✓         （进行时动词）
❌ "I'm trainingning"                ——不存在这个词，纯口误
```

## 词组 2：inference vs prediction

两个词都指「用训好的模型产出结果」，但语感有微妙分工：

| 词                       | 语感重心                        | 典型语境                                     |
| ------------------------ | ------------------------------- | -------------------------------------------- |
| **predict / prediction** | 强调「预测未来/未知」的结果本身 | 房价预测、天气预测——输出是数值               |
| **inference / infer**    | 强调「推理」的过程与系统阶段    | inference server / inference cost / 推理引擎 |

**辨析钩子**：prediction 偏「结果名词」，inference 偏「过程/部署阶段」。工业界的分工惯例：

```text
训练阶段 → 部署阶段 的行话映射：
training   ↔  inference        （基础设施语境：inference server 更便宜）
fitting    ↔  predicting       （统计/ML 教材语境）
```

**翻车现场**：把「推理服务器」说成 prediction server——能听懂但不专业；论文里 "during prediction" 也常见，不算错，但 "during inference" 在系统类论文里占绝对多数。

**延伸**：infer 在日常英语里是「推断」（从线索推出结论），学术逻辑里还有「暗示」义。AI 术语借的是逻辑学的「由已知推未知」义。

## 词组 3：epoch / iteration / batch / step

这组不是近义词，而是**同一训练过程的四个刻度**——但混用率极高。设 N=1000 个样本、batch size=100：

```text
1 epoch  = 完整过一遍全部数据 = 10 iterations = 10 steps

关系公式：iterations per epoch = N ÷ batch size
```

| 词                   | 定义                           | 本例中的值           |
| -------------------- | ------------------------------ | -------------------- |
| **batch**            | 一次前向+反向所用的样本小组    | 100 条               |
| **iteration / step** | 参数更新一次（处理一个 batch） | 10 次/epoch          |
| **epoch**            | 全部数据完整过一遍             | 每遍 10 次 iteration |

**辨析钩子**：想象读书——batch=一次读一页，iteration=读完一页翻篇，epoch=整本读完一轮。「读了 50 页」和「读了 5 遍书」是两种进度单位，混用就会闹「跑了 500 epochs」实际只等价别人 50 epochs 的笑话。

**日志实战**：训练日志常写 `Epoch 3/50, iter 450/1000, loss=0.32`——三种刻度同框各司其职，现在你能一眼读懂它了。

## 本章英文小词典

| 英文             | 中文    | 一句话记忆                    |
| ---------------- | ------- | ----------------------------- |
| Train (v.)       | 训练    | 喂数据调参数的动作            |
| Training         | 训练    | 过程名词，也作定语            |
| Trainer          | 训练器  | 封装训练循环的代码（HF 惯例） |
| Inference        | 推理    | 部署阶段的产出过程            |
| Prediction       | 预测    | 强调结果本身                  |
| Epoch            | 轮次    | 全数据过一遍                  |
| Iteration / Step | 迭代/步 | 参数更新一次                  |
| Batch            | 批      | 一次更新用的样本小组          |

## 自测一下

> [!question]- 1. 换算题：N=60000 样本、batch size=150，训练 30 epochs。总共多少次参数更新？
> 每 epoch 迭代数 = 60000÷150 = 400 次。
> 总更新次数 = 400 × 30 = **12000 次 iteration/step**。
> 这道换算是看懂任何训练日志（如 wandb/tensorboard 曲线横轴）的前提——曲线横轴写 step 还是 epoch，含义差 400 倍。

> [!question]- 2. 改错题：「After training, we deploy the trainer to production for real-time predictions.」哪里别扭？
> 「deploy the trainer」别扭——trainer 是训练期的代码封装，部署上线的应该是 **model**（或 inference server/service）。
> 正确版："After training, we deploy the **model** to production for real-time **inference**."（顺带 predictions→inference 更符合部署语境。）
> 一句话里两处措辞升级，就是母语者与新手的语感差距所在。

> [!question]- 3. 为什么推理服务叫 inference server 而不叫 prediction server？从词源角度给出解释。
> infer 源自拉丁语 in-（向内）+ ferre（携带）——「由已知带出未知」，强调**依据已有模型推导**的过程性；predict 源自 prae-（预先）+ dicere（说）——「预先说出」，强调对未来的断言。
> 部署服务的核心动作是「用固定模型对新输入做推导」，不预设输入是否关于未来——房价预测是 predict，图片分类也是 inference 但谈不上「预测未来」。inference 的语义覆盖面更宽，因此成为系统/部署层的通用行话。

> [!question]- 4. 团队约定「loss 曲线按 epoch 画」，同事的代码却每 10 个 step 记录一次点。他的曲线和约定的曲线有什么区别？
> 他的曲线横轴粒度细 400 倍（若 N=60000, batch=150）：能看到 epoch 内部的锯齿波动（不同 batch 的损失抖动），而按 epoch 画的曲线每个点已是全数据平均，更平滑。
> 两者信息量不同：step 级曲线适合诊断震荡/发散（DL12 的学习率诊断），epoch 级适合判断收敛与早停（ML4）。**粒度没有对错，但要与用途匹配并写进图注**。

## 下一步

- [[english/terms-etymology|T3 · 有词源的术语]]——token、embed、fine-tune 背后的故事
- 相关课程：[[ai/ml/model-evaluation|ML9]]（precision/recall 数学）、[[prerequisites/math/statistics|M10]]

→ 返回 [[english/ai-terms/index|🤖 AI 术语深挖目录]]
