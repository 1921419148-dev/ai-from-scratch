---
title: AI 术语的词根词缀密码 English Roots & Affixes in AI Terms
description: 认识 trans-、neuro-、-tion 这些「偏旁部首」，见词猜意，不用死背
last_verified: 2026-08-22
---

> [!abstract] 本课将学到
>
> - 英文术语和中文汉字一样有「偏旁部首」——**词根（Root）**管意思、**前缀（Prefix）**管方向、**后缀（Suffix）**管词性
> - 掌握十几个高频部件，就能猜出几十个 AI 术语的大致意思
> - 拆解 transfer、transformer、regression、supervision 等高频词，你会发现它们都是「拼」出来的

## 生活场景切入

你早就用过这个方法了——中文。

看到没见过的字「鲯」，你会猜：鱼字旁 → 是一种鱼。看到「转账」，你知道跟钱有关、还换了个地方。这就是**偏旁部首**的力量：不认识也能猜个八九不离十。

英文也有自己的偏旁部首：

```text
trans-  = 转移、穿过（像「转」）
form    = 形状、形式（像「形」）
-er     = 做……的人/东西（像「者」）
```

所以 **transformer** = trans（转移）+ form（形状）+ er（者）→「改变形状的东西」。ChatGPT 的核心架构 Transformer，名字本意就是「变换器」——把一串词变换成另一串表示。

> [!tip] 为什么这招在 AI 领域特别好使？
> 因为 AI 术语几乎全是**科学家用常见词根现场拼装**的，不像日常英语里一堆历史遗留的不规则词。规则性极强，是最好啃的一块英语。

## 核心概念拆解

### 一个单词的三段结构

```text
[前缀 prefix] + [词根 root] + [后缀 suffix]
   管方向         管意思        管词性
```

拿一个真实术语拆给你看——**regression**（回归，机器学习最基础的算法之一）：

| 部件  | 是什么 | 意思                                        |
| ----- | ------ | ------------------------------------------- |
| re-   | 前缀   | 往回、反复                                  |
| gress | 词根   | 走（progress = pro 向前 + gress 走 = 前进） |
| -ion  | 后缀   | 名词后缀（……的行为）                        |

re + gress + ion = 「往回走」→ 统计学里的意思是「退回到平均值」（这个冷知识第 2 课细讲）。你看，**每个零件都认识之后，整词的意思是有逻辑的**，不是一串随机字母。

### 高频前缀 TOP 8

| 前缀            | 意思         | AI 术语例子                                                                |
| --------------- | ------------ | -------------------------------------------------------------------------- |
| trans-          | 转移、穿过   | trans**fer** learning（迁移学习）、trans**former**                         |
| super-          | 在上、监督   | **super**vised learning（监督学习）                                        |
| auto-           | 自己、自动   | **auto**encoder（自编码器）、**auto**matic                                 |
| re-             | 回、再       | **re**gression（回归）、**re**current（循环的）、**re**inforcement（强化） |
| de-             | 去、解、向下 | **de**ep（深的）、**de**noise（去噪）、**de**code（解码）                  |
| un- / non-      | 不、非       | **un**supervised（无监督的）、**non**linear（非线性）                      |
| inter- / intra- | 之间 / 内部  | **inter**polation（插值）/ **intra**-image（图内）                         |
| multi-          | 多           | **multi**modal（多模态）、**multi**layer（多层）                           |

### 高频词根 TOP 10

| 词根   | 意思       | AI 术语例子                                                              |
| ------ | ---------- | ------------------------------------------------------------------------ |
| neuro  | 神经       | **neuro**n（神经元）、**neuro**network（神经网络）                       |
| form   | 形式、形状 | per**form**ance（性能）、trans**form**er、in**form**ation（信息）        |
| train  | 训练、拉   | **train**ing（训练）——原意「拖拽训练动物」                               |
| grad   | 步、级     | **grad**ient（梯度）、**grad**ually（逐渐地）                            |
| dict   | 说、预言   | pre**dict**（预测）、**dict**ate ——pre- 前面 + dict 说 = 提前说 = 预测   |
| vis    | 看         | su**pervis**ion（监督）、**vis**ual（视觉的）——super 在上面看着你 = 监督 |
| gen    | 生、产生   | **gen**erate（生成）、**gen**eral（泛化、通用）                          |
| cur(r) | 跑         | re**curr**ent（循环神经网络 RNN）、oc**curr**ence（出现）                |
| cept   | 拿、取     | con**cept**（概念）、per**cept**ron（感知机）                            |
| put    | 计算、思考 | com**put**er（计算机）、**put**ation（计算）                             |

### 高频后缀：一眼判断这个词是干嘛用的

后缀不改核心意思，但告诉你**词性**——读句子时这能帮你快速定位哪个词才是重点：

| 后缀          | 变成                 | 例子                                                                         |
| ------------- | -------------------- | ---------------------------------------------------------------------------- |
| -tion / -sion | 名词（动作本身）     | activ**ation**（激活值）、regress**ion**（回归）、classificat**ion**（分类） |
| -er / -or     | 名词（做动作的东西） | classifi**er**（分类器）、comput**er**、act**or**-critic                     |
| -al / -ic     | 形容词               | neuron**al**（神经网络的）、gener**ic**（通用的）                            |
| -ity / -nce   | 名词（性质）         | accur**acy**（准确率）、infer**ence**（推理）                                |
| -ize          | 动词（使……化）       | normal**ize**（归一化）、vector**ize**（向量化）、optim**ize**（优化）       |

### 实战：拆 5 个「看起来很吓人」的术语

现在合上表格，跟我一起拆。先自己试，再看答案：

**① unsupervised learning（无监督学习）**

```text
un(不) + super(在上面) + vis(看) + ed(形容词尾)
= 不被在上面的眼睛看着的学习
= 没有「老师」给标准答案的学习 ✓
```

**② backpropagation（反向传播）**

```text
back(向后) + pro(向前) + pagat(传播、走) + ion(名词)
= 把信号往回传播的过程
（propagate 传播 ← propagare 拉丁语「蔓延、繁殖」）
```

**③ generalization（泛化）**

```text
gen(产生) + al(形容词) + ize(动词) + ation(名词)
= 从训练数据里「生出」通用规律的能力
→ 模型在没见过的数据上的表现，就叫它的泛化能力 ✓
```

**④ convolution（卷积，CNN 的 C）**

```text
con(一起) + volut(转、卷) + ion(名词)
= 卷在一起的操作
→ 用一个小窗口在图片上滚动扫描，就是「卷」的动作
```

**⑤ hallucination（幻觉）**

```text
hallucin(心智漫游) + ation(名词)
= 心神产生了不存在的东西
→ AI 一本正经地编造事实，就叫幻觉 ✓
```

## 数学在哪里？

这一课不需要数学。唯一沾点边的是**组合的思想**：

```text
已知前缀 ~15 个 × 常用词根 ~30 个 × 后缀 ~5 个
理论组合数 ≈ 2000+
```

而 AI 论文里真正高频的术语也就一两百个——**用不到 50 个零件就能覆盖它们**。这笔账说明：拆零件比整词硬背划算得多。

## 交互演示：术语拆词机

<iframe src="/static/widgets/en-root-decoder.html" class="widget-frame" style="height:560px"></iframe>

试着这样玩：

1. 选一个你觉得最吓人的术语，看它被一层层拆开
2. 先遮住结果，自己口头拆一遍再对答案
3. 点「随机考我」，测试能不能见词猜意

## 本章英文小词典

| 英文                  | 中文       | 一句话记忆                                 |
| --------------------- | ---------- | ------------------------------------------ |
| Prefix                | 前缀       | pre（前面）+ fix（固定）→ 固定在前面的零件 |
| Suffix                | 后缀       | suf（下面、跟着）+ fix → 跟在后面的零件    |
| Root                  | 词根       | 单词的核心意思所在                         |
| Transfer Learning     | 迁移学习   | 把学过的东西 trans（转移）到新任务上       |
| Supervised Learning   | 监督学习   | 有 supervisor（监督者）给答案地学习        |
| Unsupervised Learning | 无监督学习 | 没有标准答案，自己找规律                   |
| Prediction            | 预测       | pre（提前）+ dict（说）                    |
| Generalization        | 泛化       | 学到的规律能「生」出到新场景               |

## 自测一下

> [!question]- 1. 拆解 transformer 这个词，并说出它为什么适合做语言模型的名字。
> trans（转移、变换）+ form（形式）+ er（……的东西）=「变换器」。语言模型做的事正是**变换**：把输入的一句话变换成内部表示（向量），再变换成下一个词的概率输出。「变换器」名副其实。

> [!question]- 2. 看到 reinforcement learning（强化学习），不查词典，猜猜 reinforce 的构成和含义？
> re（再次、加强）+ in（往里）+ force（力量）= 往里面再加力 = **增强、强化**。reinforcement learning 就是「通过奖励不断增强某种行为」的学习方式。（force 力量这个词认识的话，整个词几乎是白送的）

> [!question]- 3. 术语 decoder（解码器）里藏着哪个词根？encoder 又是什么？
> 共享词根 **cod(e)**（编码；来自 code 代码），de- 表示「解开、去掉」，en- 表示「使进入、加以」。所以 encoder = 编码器（把信息编成内部表示），decoder = 解码器（把内部表示还原成输出）。两个词共享词根、方向相反——这就是词根法的典型好处：**认识一个，半价送你一对**。

> [!question]- 4. 下面哪个不是「名词后缀」：-tion、-ize、-er、-ity？
> **-ize** 不是——它是动词后缀（normalize 归一化、summarize 总结）。其余三个都把词变成名词：action、classifier、accuracy。读论文时看到 -ize 结尾的词，它多半在描述「做什么操作」而不是「什么东西」。

## 下一步

- [[prerequisites/english/high-frequency-terms|E2 · 高频术语 100 词（中英对照）]]——带着刚学的零件去批量认词
- 想提前感受实战？跳去 [[getting-started/what-is-ai|什么是人工智能]] 复习一遍，圈出所有带前缀的术语试试拆解

→ 返回 [[prerequisites/english/index|🔤 AI 英语目录]]
