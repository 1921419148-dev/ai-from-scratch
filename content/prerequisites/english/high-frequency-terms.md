---
title: 高频术语 100 词（中英对照）100 High-Frequency AI Terms
description: 覆盖日常阅读 90% 场景的术语速查——按场景分组，每组都标注词根零件
last_verified: 2026-08-22
---

> [!abstract] 本课将学到
>
> - 不背单词表，而是**按使用场景**批量认识高频术语：读新闻、看教程、跑项目各需要哪些词
> - 每个术语都给出「一句话记忆」，能拆的都拆开——这是 [[prerequisites/english/word-roots|E1 词根词缀]] 的实战演练
> - 学完本课，读中文 AI 文章时遇到中英混排不会再卡壳

## 生活场景切入

想象三个场景：

1. 刷到一条新闻：「OpenAI 发布新模型，幻觉率降低 60%」
2. 打开一篇教程：「首先加载 dataset，然后划分 training set 和 test set」
3. 同学聊实习：「我在调 hyperparameter，跑一轮 epoch 要半小时」

发现了吗？**这三个场景的英文词汇几乎不重叠**。所以本课不按字母序排单词表，而是按「你会在哪里遇到它们」分组——一次记住一组，遇到就能认出来。

> [!tip] 使用方法
> 本课是「速查表 + 记忆卡」，不需要一口气读完。建议：先通读一遍圈出不认识的，之后每次在读文章时被卡住就回来 Ctrl+F。

## 核心概念拆解

### 第一组：大圈子词（读任何 AI 内容都会遇到）

| 英文                         | 中文     | 一句话记忆                            |
| ---------------------------- | -------- | ------------------------------------- |
| Artificial Intelligence (AI) | 人工智能 | artificial 人造 + intelligence 智能   |
| Machine Learning (ML)        | 机器学习 | machine 机器 + learning 学习          |
| Deep Learning (DL)           | 深度学习 | deep 指「很多层」的神经网络           |
| Neural Network               | 神经网络 | neuro 神经（模仿脑神经元的数学模型）  |
| Model                        | 模型     | 学到的规律本体                        |
| Algorithm                    | 算法     | 解决问题的明确步骤                    |
| Parameter                    | 参数     | 模型内部可调的「旋钮」                |
| Inference                    | 推理     | infer 推断 → 用训练好的模型回答新问题 |

### 第二组：数据与训练（看教程、跑代码的高频区）

| 英文              | 中文     | 一句话记忆                                  |
| ----------------- | -------- | ------------------------------------------- |
| Dataset           | 数据集   | data 数据 + set 集合                        |
| Sample / Instance | 样本     | 一条具体的数据记录                          |
| Feature           | 特征     | 数据的某个属性（房子的面积、位置……）        |
| Label             | 标签     | 数据的「标准答案」                          |
| Training Set      | 训练集   | 上课用的题                                  |
| Test Set          | 测试集   | 考试用的题（考前不能偷看）                  |
| Validation Set    | 验证集   | 模拟考，用来调学习方法                      |
| Training          | 训练     | 调整参数的过程                              |
| Epoch             | 轮次     | 全部训练数据完整过一遍                      |
| Batch             | 批次     | 一次同时喂给模型的样本数                    |
| Loss Function     | 损失函数 | 衡量「错得有多离谱」的尺子                  |
| Overfitting       | 过拟合   | 把练习题答案背下来了，考试稍变就懵          |
| Underfitting      | 欠拟合   | 连练习题都没学会                            |
| Accuracy          | 准确率   | ac(加强) + cur(在意细节) + acy → 答对的比例 |

### 第三组：模型家族（读新闻时的主角们）

| 英文                                     | 中文               | 一句话记忆                                                            |
| ---------------------------------------- | ------------------ | --------------------------------------------------------------------- |
| Large Language Model (LLM)               | 大语言模型         | 规模巨大的语言模型                                                    |
| GPT (Generative Pre-trained Transformer) | 生成式预训练变换器 | 三个词根全家桶！gen 生成 + pre 提前 + train 训练 + transformer 变换器 |
| Transformer                              | 变换器             | trans 转 + form 形 + er 者                                            |
| Token                                    | 词元               | 模型眼里的「最小积木」，一个字或半个词                                |
| Embedding                                | 嵌入 / 向量表示    | em(进入) + bed(床) → 把词「放进」数字空间里躺好                       |
| Prompt                                   | 提示词             | 你给大模型的输入指令                                                  |
| Hallucination                            | 幻觉               | AI 一本正经地编造不存在的东西                                         |
| Fine-tuning                              | 微调               | fine 精细 + tuning 调整 → 在预训练基础上小幅调整                      |
| Multimodal                               | 多模态             | multi 多 + mod 形态 → 能同时处理图、文、音                            |
| RAG (Retrieval-Augmented Generation)     | 检索增强生成       | 先 retrieve 检索资料，再 augment 增强 + generate 生成回答             |

### 第四组：学习范式（区分「怎么学」的三兄弟）

| 英文                        | 中文       | 一句话记忆                                      |
| --------------------------- | ---------- | ----------------------------------------------- |
| Supervised Learning         | 监督学习   | super 在上 + vis 看 → 有老师看着给答案          |
| Unsupervised Learning       | 无监督学习 | un 不 + supervised → 没有标准答案自己悟         |
| Reinforcement Learning (RL) | 强化学习   | re 再 + in 里 + force 力 → 用奖励不断加强行为   |
| Classification              | 分类       | class 类别 + ion → 判断属于哪一类（选猫还是狗） |
| Regression                  | 回归       | re 回 + gress 走 → 预测连续数值（预测房价）     |
| Clustering                  | 聚类       | cluster 一簇 → 把相似的东西归成一堆堆           |

### 第五组：跑项目必会（实验报告和工具里的常客）

| 英文                                    | 中文         | 一句话记忆                                                  |
| --------------------------------------- | ------------ | ----------------------------------------------------------- |
| Hyperparameter                          | 超参数       | hyper 超越 → 训练前由人设定的参数（区别于模型自己学的参数） |
| Gradient Descent                        | 梯度下降     | grad 步 + de 向下 + scend 爬 → 顺着下坡路找最低点           |
| Learning Rate                           | 学习率       | 每次下山迈多大步                                            |
| Convergence                             | 收敛         | con 共同 + verge 转向 → 损失不再下降，模型稳定了            |
| Preprocessing                           | 预处理       | pre 提前 → 正式训练前清洗整理数据                           |
| Normalization                           | 归一化       | norm 标准 + ize 使…化 → 把数值拉到统一尺度                  |
| Deployment                              | 部署         | de 解开 + ploy 折叠 → 把打包好的模型展开上线                |
| Benchmark                               | 基准测试     | 评测模型好坏的标准考卷                                      |
| Open Source                             | 开源         | 代码公开可下载                                              |
| API (Application Programming Interface) | 应用程序接口 | 别人写好的功能，你按规矩调用                                |

### 第六组：新闻热词（刷资讯专用）

| 英文                                  | 中文         | 一句话记忆                               |
| ------------------------------------- | ------------ | ---------------------------------------- |
| AGI (Artificial General Intelligence) | 通用人工智能 | general 泛化 → 啥都会做的 AI（尚未实现） |
| Alignment                             | 对齐         | 让 AI 的行为符合人类意图                 |
| Scaling Law                           | 缩放定律     | scale 规模 → 模型越大越强的经验规律      |
| Open Weights                          | 开放权重     | 公开了模型参数文件，可以自己下载运行     |
| Agent                                 | 智能体       | 能自主规划并调用工具完成任务的 AI        |
| Guardrail                             | 护栏         | guard 守卫 → 防止 AI 输出有害内容的机制  |

## 数学在哪里？

这一课同样不涉及计算。唯一值得留意的规律藏在 **GPT 的全称**里：

```text
Generative Pre-trained Transformer
   ↓          ↓           ↓
 gen 生成   pre 提前    transform 变换
```

一个名字 = 三段构词法的现场教学。以后看到任何缩写，先查全称再拆词根，意思基本就出来了。这个习惯比背 100 个缩写有用。

## 交互演示

本课以速查为主，交互演示放在 [[prerequisites/english/word-roots|E1]] 的拆词机里更合适——回去把「随机考我」多玩几轮，这 100 词里大部分你已经能认出来了。

## 本章英文小词典

本课正文本身就是词典，这里只补 3 个「元词汇」——描述术语的术语：

| 英文         | 中文   | 一句话记忆                                          |
| ------------ | ------ | --------------------------------------------------- |
| Abbreviation | 缩写   | LLM、GPT、RAG 都是 abbreviation                     |
| Term         | 术语   | 某个领域的专用说法                                  |
| Glossary     | 术语表 | 本站的 [[appendix/glossary\|总术语表]] 就叫这个名字 |

## 自测一下

> [!question]- 1. training set、validation set、test set 分别对应学生生活中的什么？
> 练习题（training set，反复做、用来学会）、模拟考（validation set，检验学习方法、据此调整）、高考（test set，最终检验，考前绝不能碰）。三者混淆会导致成绩造假——模型在 test set 上「偷练」出来的高分叫数据泄露（data leakage）。

> [!question]- 2. parameter 和 hyperparameter 都带 -parameter，差别在哪？
> **parameter**（参数）：模型在训练中**自己学到**的数值，比如神经网络的权重——相当于学生做题过程中形成的解题直觉。**hyperparameter**（超参数）：训练开始前**由人设定**的配置，比如学习率、batch size——相当于学生给自己定的「每天刷几页题」。hyper-（超越、在上）暗示它站在参数之上、管辖参数。

> [!question]- 3. 「这个模型 overfitting 了」用大白话解释是什么意思？两个可能的解决方向是什么？
> 意思：模型把训练数据「背」得太死，连噪声都记住了，导致在新数据上表现变差——像只背题库原题的学生，题目稍一变形就不会。方向①给模型「减负」（简化模型结构）；②给它更多样的练习题（增大数据量），或训练时加约束（正则化 regularization）。

> [!question]- 4. 不查资料，说出 RAG 这个缩写的全称和它解决的问题。
> Retrieval-Augmented Generation（检索增强生成）。解决的问题是：大模型的知识停留在训练截止日、还爱编造（幻觉）。RAG 让模型回答前先去外部知识库检索（retrieve）相关资料，把回答建立在真实文档之上——相当于开卷考试，而不是凭记忆硬答。

## 下一步

- [[prerequisites/english/how-to-read-docs|E3 · 如何读懂一篇英文教程/文档]]——词汇过关后，学阅读策略
- 发现哪个词在本站 glossary 里没有？欢迎对照 [[appendix/glossary|📖 总术语表]] 查漏

→ 返回 [[prerequisites/english/index|🔤 AI 英语目录]]
