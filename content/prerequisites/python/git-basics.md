---
title: Git 版本控制速成 Git Essentials
description: 写代码的人为什么都需要时间机器——init/add/commit/push 四步上手，分支与回滚不再可怕
last_verified: 2026-08-24
---

> [!abstract] 本课将学到
>
> - Git 是什么：**给代码装一台时间机器**
> - 六条命令覆盖 90% 的日常使用
> - **分支（Branch）**：平行宇宙的创建与合并
> - 本站的 5 Agent 协作体系就是建立在 Git 之上的真实案例

## 生活场景切入

你写过这样的文件吗：

```text
毕业论文.docx
毕业论文_修改版.docx
毕业论文_修改版_v2.docx
毕业论文_最终版.docx
毕业论文_最终版_真最终版.docx
毕业论文_导师说改第3段.docx
```

Git 彻底解决这个问题：**每个版本都有编号和备注，随时回到任何历史时刻，多人协作永不互相覆盖**。

它不只是程序员工具——写论文、做设计稿、管理任何「会反复修改的文件」都该用。

## 核心概念：三个区域

Git 把你的文件分成三个区域，理解了它们就理解了 Git：

```text
工作区 (Working Directory)     暂存区 (Staging Area)      仓库 (Repository)
   你正在编辑的文件          →    准备要保存的改动      →    已永久记录的历史
                              git add                   git commit
        ←──────────── git checkout ────────────←
```

**类比**：拍照流程。

| 区域   | 类比                 | 命令           |
| ------ | -------------------- | -------------- |
| 工作区 | 你在取景框里摆姿势   | （直接改文件） |
| 暂存区 | 按下预览确认选好了   | `git add`      |
| 仓库   | 「咔嚓」正式拍照存档 | `git commit`   |

## 六条命令走天下

### 首次配置（只需一次）

```bash
git config --global user.name "你的名字"
git config --global user.email "your@email.com"
```

### 日常六步

```bash
# ① 初始化仓库（在一个空文件夹或已有项目里执行一次）
git init

# ② 查看当前状态（最常用的命令——迷茫就先敲这个）
git status
# 输出：红色=改了但没暂存；绿色=已暂存待提交

# ③ 把改动放入暂存区
git add 文件名          # 添加指定文件
git add .              # 添加所有改动

# ④ 提交快照（附一句描述）
git commit -m "添加了用户登录功能"

# ⑤ 查看历史记录
git log --oneline
# 输出:
# a1b2c3d 添加了用户登录功能
# e4f5g6h 初始化项目

# ⑥ 关联远程仓库并推送
git remote add origin https://github.com/你/仓库.git
git push -u origin main
```

**日常循环**：改代码 → `git add .` → `git commit -m "描述"` → 定期 `git push`。

## 分支 —— 平行宇宙

```bash
# 创建并切换到新分支（相当于复制当前进度开一条新时间线）
git branch dev           # 创建
git checkout dev         # 切换过去
# 或一步到位：
git checkout -b dev

# 在 dev 上正常开发、提交...

# 开发完成后合并回主分支
git checkout main        # 先切回主线
git merge dev            # 把 dev 的成果合进来
```

**什么时候用分支**：

```text
✅ 尝试一个不确定能成的新功能 → 开个分支试，失败就丢弃
✅ 修 bug 但不想影响正在开发的代码 → hotfix 分支
❌ 只是改一行注释 → 直接在 main 改就行，别过度工程化
```

本站的真实案例：宪章要求每个任务从 main 切独立分支（如 `ai/aic/AIC-DL1-DL6`），完成后合并回去。这样多个 Agent 并行工作互不干扰——你现在看到的网站就是这么造出来的。

## 回滚 —— 时间机器的核心功能

```bash
# 回到上一个提交（放弃当前未提交的改动）
git checkout -- 文件名

# 回到某个历史版本看一眼（不影响当前）
git checkout a1b2c3d -- 文件名

# 撤销最近一次 commit 但保留改动
git reset --soft HEAD~1

# 彻底回到两个 commit 之前（危险！不可逆）
git reset --hard HEAD~2
```

⚠️ `--hard` 是危险操作，执行前用 `git log --oneline` 确认你要回到的位置。

## GitHub 协作 —— push 与 pull

```bash
git pull origin main     # 从远端拉取最新（别人可能推了新代码）
git push origin main     # 把本地推送到远端
```

**黄金法则**：push 之前先 pull——如果别人在你之后推了代码，不先 pull 会冲突被拒。

## 本章英文小词典

| 英文        | 中文      | 一句话记忆                     |
| ----------- | --------- | ------------------------------ |
| Repository  | 仓库      | 项目 + 全部历史的容器          |
| Commit      | 提交      | 一次带备注的快照               |
| Staging     | 暂存区    | 从改动到提交的中转站           |
| Branch      | 分支      | 平行时间线                     |
| Merge       | 合并      | 把分支的成果汇入主线           |
| Push / Pull | 推送/拉取 | 上传到远端 / 从远端下载        |
| Clone       | 克隆      | 复制整个远程仓库到本地         |
| Conflict    | 冲突      | 两个人改了同一行，需要人工裁决 |

## Code Lab：亲手运行

下面的实验会真实执行代码，内容和完成状态只保存在当前浏览器。先运行默认代码，再按本课任务修改。

<iframe src="/static/labs/lab#git-basics" class="widget-frame code-lab-frame" style="height:520px" title="Git 版本控制速成 Git Essentials Code Lab"></iframe>

### 分步任务

1. 运行默认代码并解释输入、处理和输出。
2. 修改一个值或条件，预测结果后再次运行。
3. 完成本课挑战，直到自动检查通过。

## 自测一下

> [!question]- 1. 你改了三个文件但只想提交其中一个，该怎么做？
> 用 `git add 只加那个文件`：
>
> ```bash
> git add config.py        # 只暂存这一个
> git commit -m "修复配置读取bug"
> # 另外两个文件仍在工作区，下次再提交
> ```
>
> 这正是三区域设计的价值：add 是选择器，让你精确控制每次 commit 包含什么。如果用 `git add .` 就会把不相关的改动混进同一个 commit——好的 commit 应该是原子性的（一个 commit 只做一件事）。

> [!question]- 2. `git reset --hard HEAD~1` 和 `git reset --soft HEAD~1` 有什么区别？
> 两者都把 HEAD 移回上一个 commit，区别在于对工作区的处理：
> `--soft`：commit 被撤销但**改动保留在工作区**——适合「commit 信息写错了重新提交」。
> `--hard`：commit 和改动**全部销毁**——文件回到上个版本的状态，当前修改丢失。
> 记忆钩子：soft = 温柔地撤（留后路），hard = 硬核重置（不留活口）。用 hard 之前务必确认没有未保存的重要改动。

> [!question]- 3. 为什么团队协作时「push 前先 pull」是黄金法则？如果不遵守会发生什么？
> 如果同事 B 在你 push 之后也 push 了新代码，此时你再 push 会被拒绝（因为远端有你没有的新 commit）。
> 正确顺序：pull（拉下别人的更新）→ 解决可能的冲突 → 再 push。
> 不遵守的后果：强制 push (`git push --force`) 会**抹掉同事的代码**——这是 Git 世界里最恶劣的操作之一。本站多 Agent 宪章要求串行合并就是为了避免这种冲突。
> 元思想：Git 的冲突机制本质上是**强制你面对差异而不是悄悄覆盖**——这比「最后保存的人赢」的文件共享方式安全得多。

> [!question]- 4. 你在 dev 分支上写了半天的代码还没 commit，突然被告知 main 上有个紧急 bug 要立刻修。怎么办？
> 两种方案：
> 方案① **stash 暂存**：
>
> ```bash
> git stash          # 半成品安全存入临时储物柜
> git checkout main  # 切到主分支修 bug
> # ...修完 commit...
> git checkout dev   # 回到开发分支
> git stash pop      # 取出刚才存的半成品继续干活
> ```
>
> 方案② **先 commit 半成品**：`git add . && git commit -m "WIP: 进行中"` → 切分支修 bug → 回来继续开发（后续可以 amend 或 squash）。
> 核心思路：**Git 的所有操作都以 commit 为安全点**——养成频繁小 commit 的习惯，紧急情况就不慌。

## 下一步

- [[prerequisites/python/api-basics|下一篇 · 第一次调用大模型 API]]
- 相关：[[prerequisites/python/index|🐍 Python 目录]] · [[getting-started/read-paper-walkthrough|📖 论文精读]]

→ 返回 [[prerequisites/python/index|🐍 Python 目录]]
