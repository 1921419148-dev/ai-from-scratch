import { formatDate } from "./Date"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, SimpleSlug, RelativeURL, simplifySlug } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
// @ts-ignore
import sceneScript from "./scripts/portal-scene.inline"
// @ts-ignore
import menuScript from "./scripts/portal-menu.inline"
import style from "./styles/portal.scss"

/**
 * Portal — EUTOPIA 奇幻门厅
 *
 * 三层游戏式导航（slug 门控，仅门厅页渲染）：
 *   index          → 第一层：语言选择（EUTOPIA 悬浮字 + 语言选项）
 *   ch/index       → 第二层：中文主菜单（开始学习 / 路线图 / 工具箱）
 *   ch/learn/index → 第三层：板块浮岛选择（带各板块实时统计）
 *
 * 场景渲染与过场动画见 portal-scene.inline.ts / portal-menu.inline.ts。
 */

const PORTAL_SLUGS = new Set(["index", "ch/index", "ch/learn/index"])

/**
 * 门厅页专属相对链接：以【页面目录】为基准解析。
 *
 * 门厅三层都是 folder-index 页面（URL 形如 /ch/），浏览器解析相对链接的
 * 基准是页面 URL 所在目录；而 resolveRelative/pathToRoot 按「文件路径」
 * 计算，对 folder-index 会多退一层（pathToRoot("ch/index") = ".."，从
 * /ch/ 出发 ../learn/ 越界成 /learn/）。这里改为：先取页面目录
 * （slug 去掉尾部 index 的部分），再按共同前缀计算上跳与下探。
 */
function dirRelative(cur: FullSlug, target: FullSlug | SimpleSlug): RelativeURL {
  const baseDir = cur.replace(/(^|\/)index$/, "") || ""
  const targetPath = simplifySlug(target as FullSlug) // e.g. "learn/" / "roadmap" / "/"
  const isDir = targetPath.endsWith("/")
  const b = baseDir.split("/").filter(Boolean)
  let t = targetPath.split("/").filter(Boolean)
  let i = 0
  while (i < b.length && i < t.length && b[i] === t[i]) i++
  const ups = b.length - i
  t = t.slice(i).filter((s) => s !== "")
  const tail = t.join("/")
  if (ups === 0) {
    if (!tail) return "./" as RelativeURL
    return `./${tail}${isDir ? "/" : ""}` as RelativeURL
  }
  return (`../`.repeat(ups) + tail + (isDir && tail ? "/" : "")) as RelativeURL
}

/** 第三层板块浮岛定义 */
const LEARN_ISLANDS = [
  { prefix: "prerequisites/math", name: "数学基础", desc: "从加减乘除补到微积分" },
  { prefix: "prerequisites/python", name: "Python 编程", desc: "零基础学编程，边写边学" },
  { prefix: "prerequisites/english", name: "AI 英语", desc: "术语密码与论文阅读" },
  { prefix: "ai", name: "人工智能大类", desc: "ML · DL · NLP · GenAI · RL · 神经网络伴学" },
  { prefix: "qingnian", name: "青年大学习", desc: "每期主题与题目整理" },
  { prefix: "appendix", name: "工具箱", desc: "术语表 · 公式卡 · 资源库" },
]

/** CJK 感知字数统计（与 Dashboard 同口径） */
function countChars(text: string | undefined): number {
  if (!text) return 0
  const cjk = (text.match(/[\p{Script=Han}぀-ヿ가-힯]/gu) ?? []).length
  const latinWords = text
    .replace(/[\p{Script=Han}぀-ヿ가-힯]/gu, " ")
    .split(/\s+/)
    .filter(Boolean).length
  return cjk + latinWords
}

function formatCount(n: number): string {
  if (n < 1000) return n === 0 ? "尚未开课" : `${n} 字`
  return `约 ${(n / 1000).toFixed(1)} 千字`
}

interface IslandStat {
  name: string
  desc: string
  href: string
  pages: number
  chars: string
  latest?: Date
}

function islandStats(allFiles: QuartzPluginData[], curSlug: FullSlug): IslandStat[] {
  return LEARN_ISLANDS.map((island) => {
    const files = allFiles.filter(
      (f) => f.slug?.startsWith(`${island.prefix}/`) && f.slug !== `${island.prefix}/index`,
    )
    let chars = 0
    let latest: Date | undefined = undefined
    for (const f of files) {
      chars += countChars(f.text)
      const d = f.dates?.modified
      if (d && (!latest || d > latest)) latest = d
    }
    // ai 大类特殊处理：排除子板块自身目录页，只统计直接子内容
    return {
      name: island.name,
      desc: island.desc,
      href: dirRelative(curSlug, `${island.prefix}/index` as FullSlug),
      pages: files.length,
      chars: formatCount(chars),
      latest,
    }
  })
}

const Portal: QuartzComponent = ({ allFiles, fileData, cfg }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  if (!PORTAL_SLUGS.has(slug)) return null

  if (slug === "index") {
    // ---------- 第一层：语言选择 ----------
    const chHref = dirRelative("index" as FullSlug, "ch/index" as FullSlug)
    return (
      <div class="portal portal-lang" data-persist-scope="portal">
        <div class="portal-sky">
          <canvas class="portal-canvas" aria-hidden="true"></canvas>
        </div>
        <div class="portal-stage">
          <h1 class="portal-word">EUTOPIA</h1>
          <p class="portal-tagline">乌托邦之门 · The Gate of Utopia</p>
          <nav class="portal-choices" aria-label="语言选择">
            <a class="portal-choice" href={chHref} data-portal-nav data-portal-transition="clouds">
              <span class="portal-choice-main">中 文</span>
              <span class="portal-choice-sub">Chinese</span>
            </a>
            <div class="portal-choice portal-choice-disabled" aria-disabled="true">
              <span class="portal-choice-main">English</span>
              <span class="portal-choice-sub">即将推出 · Coming Soon</span>
            </div>
          </nav>
        </div>
        <p class="portal-footnote">进入后可随时通过左上角门徽返回此页</p>
      </div>
    )
  }

  if (slug === "ch/index") {
    // ---------- 第二层：中文主菜单 ----------
    const learnHref = dirRelative("ch/index" as FullSlug, "ch/learn/index" as FullSlug)
    const roadmapHref = dirRelative("ch/index" as FullSlug, "roadmap" as FullSlug)
    const glossaryHref = dirRelative("ch/index" as FullSlug, "appendix/glossary" as FullSlug)
    const homeHref = dirRelative("ch/index" as FullSlug, "ch/home" as FullSlug)
    const rootHref = dirRelative("ch/index" as FullSlug, "index" as FullSlug)
    return (
      <div class="portal portal-menu" data-persist-scope="portal">
        <div class="portal-sky portal-sky-warm">
          <canvas class="portal-canvas" aria-hidden="true"></canvas>
        </div>
        <a class="portal-back" href={rootHref} data-portal-nav data-portal-transition="fade">
          ← 门厅
        </a>
        <div class="portal-stage">
          <p class="portal-kicker">EUTOPIA</p>
          <h1 class="portal-title">零基础 AI 学堂</h1>
          <nav class="portal-choices portal-choices-vertical" aria-label="主菜单">
            <a
              class="portal-choice"
              href={learnHref}
              data-portal-nav
              data-portal-transition="clouds"
            >
              <span class="portal-choice-main">开 始 学 习</span>
              <span class="portal-choice-sub">选择一个板块，进入知识世界</span>
            </a>
            <a
              class="portal-choice"
              href={roadmapHref}
              data-portal-nav
              data-portal-transition="fade"
            >
              <span class="portal-choice-main">学 习 路 线 图</span>
              <span class="portal-choice-sub">先看全局，再启程</span>
            </a>
            <a
              class="portal-choice"
              href={glossaryHref}
              data-portal-nav
              data-portal-transition="fade"
            >
              <span class="portal-choice-main">工 具 箱</span>
              <span class="portal-choice-sub">术语表 · 公式卡 · 资源库</span>
            </a>
            <a class="portal-choice" href={homeHref} data-portal-nav data-portal-transition="fade">
              <span class="portal-choice-main">传 统 首 页</span>
              <span class="portal-choice-sub">以普通网页形式浏览本站</span>
            </a>
          </nav>
        </div>
      </div>
    )
  }

  // ---------- 第三层：板块浮岛 ----------
  const stats = islandStats(allFiles, fileData.slug as FullSlug)
  const menuHref = dirRelative("ch/learn/index" as FullSlug, "ch/index" as FullSlug)
  const siteLatest = stats
    .map((s) => s.latest)
    .filter((d): d is Date => d !== undefined)
    .reduce<Date | undefined>((max, d) => (!max || d > max ? d : max), undefined)

  return (
    <div class="portal portal-islands" data-persist-scope="portal">
      <div class="portal-sky portal-sky-cool">
        <canvas class="portal-canvas" aria-hidden="true"></canvas>
      </div>
      <a class="portal-back" href={menuHref} data-portal-nav data-portal-transition="fade">
        ← 主菜单
      </a>
      <div class="portal-stage">
        <p class="portal-kicker">开始学习</p>
        <h1 class="portal-title">选择你的板块</h1>
        {siteLatest && (
          <p class="portal-updated">知识世界最近更新于 {formatDate(siteLatest, cfg.locale)}</p>
        )}
        <div class="portal-island-grid">
          {stats.map((s) => (
            <a
              key={s.href}
              class={`portal-island ${s.pages === 0 ? "portal-island-empty" : ""}`}
              href={s.href}
              data-portal-nav
              data-portal-transition="fade"
            >
              <span class="portal-island-name">{s.name}</span>
              <span class="portal-island-desc">{s.desc}</span>
              <span class="portal-island-stat">
                {s.pages > 0 ? `${s.pages} 篇 · ${s.chars}` : s.chars}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

Portal.css = style
Portal.afterDOMLoaded = sceneScript + "\n" + menuScript

export default (() => Portal) satisfies QuartzComponentConstructor
