import { readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

const root = path.resolve("content/adulting")
const verified = "2026-08-25"

const titles = {
  "academic-resources/academic-research-and-academic-writing.md": "学术研究与写作",
  "academic-resources/how-to-get-resources.md": "可靠获取学习与研究资源",
  "academic-resources/math/learning-resources.md": "大学数学学习资源",
  "academic-resources/some-key-concepts.md": "学术出版与评价常见概念",
  "academic-resources/student-resources.md": "大学生信息与支持渠道",
  "academic-resources/thesis-bachelor-science.md": "本科毕业论文实用指南",
  "academic-resources/useful-open-source-projects.md": "值得了解的开源学习项目",
  "campus-life/choose-major.md": "如何选择大学专业",
  "campus-life/getting-out-of-singleness.md": "建立健康的亲密关系",
  "general-skills/bank-accounts-and-credit-cards.md": "银行卡与信用卡安全入门",
  "general-skills/health-when-travelling.md": "旅行中的健康准备",
  "general-skills/health.md": "日常健康管理基础",
  "general-skills/qi-ji-yin-qiao/campus-running.md": "校园跑安排、反馈与申诉",
  "general-skills/qi-ji-yin-qiao/pointless-courses.md": "高效完成线上课程",
  "general-skills/study/biochem-env-materials-guide.md": "生化环材专业学习与发展",
  "general-skills/recruit-exercitation.md": "识别用人单位与求职风险",
  "growth-path/index.md": "职业与长期成长",
}

const OFFICIAL = {
  education: ["https://www.moe.gov.cn/", "https://www.chsi.com.cn/"],
  aid: ["https://www.xszz.edu.cn/", "https://www.moe.gov.cn/"],
  employment: ["https://www.ncss.cn/", "https://www.mohrss.gov.cn/"],
  health: ["https://www.nhc.gov.cn/", "https://www.who.int/zh"],
  insurance: ["https://www.nhsa.gov.cn/", "https://www.gov.cn/fuwu/"],
  finance: ["https://www.pbc.gov.cn/", "https://www.gov.cn/fuwu/"],
  security: ["https://www.cert.org.cn/", "https://www.cac.gov.cn/"],
  computing: [
    "https://support.microsoft.com/zh-cn/windows",
    "https://developer.mozilla.org/zh-CN/",
  ],
  travel: ["https://www.12306.cn/", "https://www.caac.gov.cn/"],
  postgraduate: ["https://yz.chsi.com.cn/", "https://www.neea.edu.cn/"],
  cc: ["https://creativecommons.org/licenses/by/4.0/deed.zh-hans"],
}

const fullRewrites = new Map([
  [
    "general-skills/qi-ji-yin-qiao/campus-running.md",
    guide(
      "校园跑安排、反馈与申诉",
      "当校园跑与课程、身体状况或安全条件冲突时，正确做法是记录问题、使用学校正式渠道反馈，并根据校规申请合理调整，而不是伪造定位或运动数据。",
      [
        "先阅读本校体育课程、校园跑和请假规则，确认要求与截止日期。",
        "身体不适时停止运动，按校医院或课程规定申请医疗评估与替代安排。",
        "规则明显不合理时，记录时间、天气、路线和系统故障，通过任课教师、体育部或学生申诉渠道反馈。",
        "保留提交记录和回复，不安装虚拟定位、自动跑步或规避检测的软件。",
      ],
      OFFICIAL.education,
      "L2",
    ),
  ],
  [
    "general-skills/qi-ji-yin-qiao/pointless-courses.md",
    guide(
      "高效完成线上课程",
      "线上课程效率低时，可以调整学习方法、集中处理任务并向教师反馈，但不应使用自动答题、伪造学习时长或绕过平台验证的工具。",
      [
        "先查看课程考核规则，把视频、阅读、测验和截止日期拆成清单。",
        "使用倍速、字幕或离线笔记前确认平台和教师是否允许。",
        "把重复性问题整理后一次向教师或助教询问，避免反复试错。",
        "平台故障时截图并记录时间，通过正式渠道申请补交或修复记录。",
      ],
      OFFICIAL.education,
      "L2",
    ),
  ],
  [
    "campus-life/faq-national-student-loan.md",
    guide(
      "国家助学贷款办理指南",
      "助学贷款政策和办理流程可能随地区、学年与经办银行变化。本页只提供核对路径，不给出固定额度或承诺审批结果。",
      [
        "从全国学生资助管理中心、当地教育部门或学校资助中心确认当年通知。",
        "核对申请资格、材料、合同主体、利息承担期和还款日期。",
        "只通过通知列明的官方系统或经办银行操作，不向个人账户缴纳代办费。",
        "毕业、升学、休学或联系方式变化时主动咨询合同信息是否需要更新。",
      ],
      OFFICIAL.aid,
      "L2",
    ),
  ],
  [
    "campus-life/medical-insurance.md",
    guide(
      "大学生医保使用指南",
      "大学生通常参加所在地基本医疗保险，但参保、门诊、住院和异地结算规则由当地政策与学校安排决定。就医前应查询本人实际参保状态。",
      [
        "在学校、当地医保部门或国家医保服务平台核对参保地和待遇生效时间。",
        "就医前确认定点机构、校医院转诊要求以及是否需要异地备案。",
        "保存病历、费用清单、发票和结算单；未直接结算时询问手工报销期限。",
        "急症优先就医；待遇与报销问题随后联系学校医保办或当地医保热线。",
      ],
      OFFICIAL.insurance,
      "L3",
    ),
  ],
  [
    "campus-life/mental-health.md",
    guide(
      "大学生心理健康与求助",
      "持续失眠、情绪低落、强烈焦虑或无法维持日常学习时，寻求帮助是合理的。本页不能代替医生或心理专业人员的评估。",
      [
        "先联系学校心理中心、辅导员、校医院或当地正规医疗机构。",
        "提前写下持续时间、睡眠变化、身体反应和对学习生活的影响。",
        "如果出现伤害自己或他人的紧迫风险，不要独处，立即联系可信任的人并拨打当地 120 或 110。",
        "对网络上的诊断和药物建议保持谨慎，不自行停药、换药或使用他人处方。",
      ],
      OFFICIAL.health,
      "L3",
    ),
  ],
  [
    "general-skills/bank-accounts-and-credit-cards.md",
    guide(
      "银行卡与信用卡安全入门",
      "银行卡和信用卡会影响资金安全与个人信用。开户、收费、授信和还款规则以银行合同及监管要求为准。",
      [
        "只在持牌银行官方渠道开户，认真阅读年费、利息、还款日和逾期条款。",
        "不开借给他人使用的账户，不出租出售银行卡、电话卡或支付账户。",
        "验证码、密码、动态口令和屏幕共享请求一律视为敏感操作。",
        "发现异常交易立即冻结账户、联系银行并保存报案和沟通记录。",
      ],
      OFFICIAL.finance,
      "L3",
    ),
  ],
  [
    "general-skills/health.md",
    guide(
      "日常健康管理基础",
      "健康管理的目标是建立可持续的睡眠、饮食、运动和就医习惯，而不是依靠未经验证的偏方或单一指标。",
      [
        "保持相对稳定的作息，记录长期变化而不是追求短期极端计划。",
        "运动从适合自己的强度开始；出现胸痛、晕厥或明显呼吸困难时停止并就医。",
        "使用药物和补充剂前阅读说明并咨询医生或药师。",
        "体检结果需要结合个人情况由专业人员解释。",
      ],
      OFFICIAL.health,
      "L3",
    ),
  ],
  [
    "general-skills/health-when-travelling.md",
    guide(
      "旅行中的健康准备",
      "旅行前应根据目的地、行程长度和个人健康状况准备。具体疫苗、药物和入境健康要求应查询官方最新信息。",
      [
        "确认目的地天气、海拔、传染病提示和医疗资源。",
        "携带处方药原包装、处方或医生说明，并核对运输和入境限制。",
        "购买保险前阅读医疗、既往症和紧急转运条款。",
        "出现严重症状时优先联系当地急救和正规医疗机构。",
      ],
      OFFICIAL.health,
      "L3",
    ),
  ],
  [
    "general-skills/railway-airplane-travel-guide.md",
    guide(
      "高铁与飞机出行指南",
      "车次、航班、证件和行李规则会变化，应以承运方和主管部门发布的信息为准。",
      [
        "仅从铁路 12306、航空公司或可信票务渠道核对订单。",
        "出发前再次确认车站或机场、航站楼、证件、时间和行李限制。",
        "为安检、换乘和天气延误预留时间。",
        "退改签前先阅读当前票价规则，不相信要求私下转账的客服。",
      ],
      OFFICIAL.travel,
      "L2",
    ),
  ],
  [
    "general-skills/study/yanzhao.md",
    guide(
      "研究生招生信息核对指南",
      "招生专业、名额、考试科目、复试与调剂要求以研招网、招生单位官网和当年招生简章为准。本页不再分发来源不明确的试卷 PDF。",
      [
        "从中国研究生招生信息网查询招生单位和专业目录。",
        "到目标学校研究生院核对招生简章、参考范围和复试办法。",
        "把发布日期、适用年份和原始链接保存到自己的院校表。",
        "对群聊、网盘和付费资料中的所谓内部信息保持怀疑。",
      ],
      OFFICIAL.postgraduate,
      "L2",
    ),
  ],
])

function guide(title, summary, steps, sources, risk = "L1") {
  return `> [!abstract] 这篇指南解决什么
> ${summary}

## 先做什么

${steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

## 判断信息是否可靠

- 确认发布者是否为负责该事项的政府部门、学校、医院、银行或服务运营方。
- 查看发布日期和适用范围，不把其他地区、往年或个人经验直接套用到自己身上。
- 涉及金钱、健康、身份信息或处分风险时，通过第二个官方渠道交叉确认。

## 留下自己的记录

把通知原文、办理时间、联系人、材料清单和结果放在同一个文件夹。需要申诉、补材料或再次办理时，这些记录比聊天截图更可靠。

> [!warning] 边界说明
> 本文提供信息核对与行动框架，不替代学校决定、政府政策、医疗诊断、法律意见或金融合同。风险级别：${risk}。

## 官方入口

${sources.map((source) => `- ${source}`).join("\n")}
`
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) => {
        const target = path.join(directory, entry.name)
        return entry.isDirectory() ? markdownFiles(target) : Promise.resolve([target])
      }),
    )
  )
    .flat()
    .filter((file) => file.endsWith(".md"))
}

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
}

function cleanBody(body) {
  return body
    .replaceAll("/qingnian/ac-wiki/", "/adulting/")
    .replaceAll("qingnian/ac-wiki/", "adulting/")
    .replace(/^#\s+.+\r?\n+/, "")
    .replace(/> \[!note\]- 上游备注（原文注释）[\s\S]*?(?=\n##|\n#|$)/g, "")
    .trim()
}

function classify(relative) {
  if (/medical|mental|health|bank|credit|cyber-security|password|加密通讯/.test(relative)) {
    return {
      risk: "L3",
      sources: /medical-insurance/.test(relative)
        ? OFFICIAL.insurance
        : /bank|credit/.test(relative)
          ? OFFICIAL.finance
          : /health|mental/.test(relative)
            ? OFFICIAL.health
            : OFFICIAL.security,
    }
  }
  if (
    /loan|scholarship|work-study|major-transfer|minor-or-dual|international-exchange|student-discounts|certification|yanzhao|railway|recruit/.test(
      relative,
    )
  ) {
    return {
      risk: "L2",
      sources: /railway/.test(relative)
        ? OFFICIAL.travel
        : /recruit/.test(relative)
          ? OFFICIAL.employment
          : /loan|scholarship|work-study/.test(relative)
            ? OFFICIAL.aid
            : OFFICIAL.education,
    }
  }
  if (
    /computer-basic|tools|search-platforms|open-source|student-email|bit_torrent|Authenticator/.test(
      relative,
    )
  ) {
    return { risk: "L1", sources: OFFICIAL.computing }
  }
  return { risk: "L1", sources: OFFICIAL.education }
}

function frontmatter(title, description, risk, sources) {
  const escapedTitle = title.replaceAll('"', "'")
  const escapedDescription = description.replaceAll('"', "'")
  return `---
title: "${escapedTitle}"
description: "${escapedDescription}"
last_verified: ${verified}
risk_level: ${risk}
applicable_region: 中国大陆
sources:
${sources.map((source) => `  - "${source}"`).join("\n")}
---
`
}

for (const file of await markdownFiles(root)) {
  const relative = path.relative(root, file).replaceAll("\\", "/")
  if (["index.md", "LICENSE-CC-BY-4.0.md"].includes(relative) || relative.endsWith("/index.md"))
    continue
  const old = await readFile(file, "utf8")
  const body = cleanBody(stripFrontmatter(old))
  const oldTitle = old.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] || path.basename(file, ".md")
  const title = titles[relative] || oldTitle
  const { risk, sources } = classify(relative)
  const description = `Adulting 青年大学习：${title}的可靠信息与行动指南。`
  const replacement = fullRewrites.get(relative)
  const introduction = guide(
    title,
    `本页帮助你理解“${title}”涉及的核心问题，并把零散信息整理成可以验证、可以执行的步骤。`,
    [
      "先明确自己要解决的具体问题和截止时间。",
      "优先查看学校、政府或产品官方渠道的最新说明。",
      "把选择拆成小步骤，执行后记录结果并及时复盘。",
    ],
    sources,
    risk,
  )
  const content = replacement || `${introduction}\n\n## 详细说明\n\n${body}`
  await writeFile(file, `${frontmatter(title, description, risk, sources)}\n${content.trim()}\n`)
}

console.log("Adulting article migration complete.")
