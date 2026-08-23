---
title: 强化学习 Reinforcement Learning
description: 在试错中学会决策——从游戏 AI 到大模型对齐
---

> [!abstract] 本板块解决
> 强化学习是「第三种学习范式」：没有标准答案，只有奖惩反馈。AlphaGo 用它战胜人类，ChatGPT 用它学会「说人话」（RLHF）。本板块从游戏直觉讲起，走到大模型对齐的前沿。

## 学习顺序

| #   | 课程                                                | 内容                             | 状态 |
| --- | --------------------------------------------------- | -------------------------------- | ---- |
| RL1 | [[ai/rl/what-is-rl\|什么是强化学习？]]              | 试错、奖励、策略：训练小狗的智慧 | ✅   |
| RL2 | [[ai/rl/mdp\|马尔可夫决策过程 MDP]]                 | 给「决策」建一个数学模型         | ✅   |
| RL3 | [[ai/rl/q-learning\|Q-Learning]]                    | 给每个行动打分的表格法           | ✅   |
| RL4 | [[ai/rl/policy-gradient\|策略梯度 Policy Gradient]] | 直接学习「怎么做」               | ✅   |
| RL5 | [[ai/rl/alphago\|AlphaGo 的故事]]                   | 自我博弈 40 天超越人类           | ✅   |
| RL6 | [[ai/rl/rlhf\|RLHF 与大模型对齐]]                   | ChatGPT 为什么会「礼貌拒答」     | ✅   |

> [!success] 板块毕业标准
> 能回答三个问题即可毕业：① 延迟奖励为什么是 RL 的核心难题；② Q-Learning 更新公式每一项的含义；③ RLHF 为什么要绕道奖励模型而不是让人类直接打分。

## 前置要求

深度学习 DL4（全连接网络实战）+ 概率基础（数学 M9）。

→ 相关：[[ai/dl/index|← 深度学习]] · [[ai/genai/index|GenAI →]]
