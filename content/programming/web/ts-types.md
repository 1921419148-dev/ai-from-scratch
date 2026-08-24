---
title: "W14 · TypeScript 类型"
description: "TypeScript 在运行前检查 JavaScript 中可能出现的类型错误。"
last_verified: 2026-08-25
tags:
  - 编程学院
  - Web
---

> [!abstract] 本课将学到
> 类型注解、对象类型与编译。完成后，你会亲手修改示例并通过自动检查。

## 生活场景切入

TypeScript 在运行前检查 JavaScript 中可能出现的类型错误。先把它看成解决具体问题的工具，不需要一次记住所有语法。

## 核心概念

**类型注解** 是本课的核心。阅读代码时，先找输入，再看处理规则，最后确认输出。遇到陌生符号时逐行运行，比死记定义更有效。

## 可运行示例

下面的 Code Lab 在浏览器内运行。代码和完成状态只保存在当前设备，不会上传到服务器。

<iframe src="/static/labs/lab?lesson=ts-types" class="widget-frame code-lab-frame" style="height:520px" title="W14 · TypeScript 类型 Code Lab"></iframe>

## 分步任务

1. 先运行默认代码，确认输出与代码的对应关系。
2. 给课程对象增加 completed: boolean 字段。
3. 再运行一次，直到页面显示“检查通过”。
4. 用一句自己的话解释修改前后为什么不同。

## 常见错误

> [!warning] 先检查这一点
> 类型只负责检查，不会自动校验网络返回的数据。

## 挑战题

不看默认示例，从空白开始写出一个更贴近你自己学习生活的版本。完成后刷新页面，确认代码仍能恢复。

> [!question]- 参考思路
> 先写出最小可运行版本，再一次只增加一个条件、字段或界面元素。每次修改后都运行，出错范围就会很小。

## 本章英文小词典

| 英文    | 中文     | 本课中的意思         |
| ------- | -------- | -------------------- |
| runtime | 运行环境 | 真正执行代码的环境   |
| output  | 输出     | 程序执行后产生的结果 |
| debug   | 调试     | 定位并修正代码问题   |

## 下一步

[[programming/web/ts-modeling|W15 · TypeScript 数据建模]]
