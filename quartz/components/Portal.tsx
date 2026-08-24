import { formatDate } from "./Date"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, SimpleSlug, RelativeURL, simplifySlug } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
// @ts-ignore
import sceneScript from "./scripts/portal-scene.inline"
// @ts-ignore
import themeScript from "./scripts/portal-theme.inline"
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
 * 视觉：晨曦云海 / 极光夜空双主题（跟随 saved-theme），五层 3D 视差场景。
 * 场景渲染见 portal-scene.inline.ts，过场动画见 portal-menu.inline.ts，
 * 门厅内主题切换钮见 portal-theme.inline.ts。
 */

export const PORTAL_SLUGS = ["index", "ch/index", "ch/learn/index"] as const

const PORTAL_SLUG_SET = new Set<string>(PORTAL_SLUGS)

/** 场景分层（三层页面共用同一套背景） */
function SceneLayers() {
  return (
    <div class="portal-scene" aria-hidden="true">
      {/* 远景：天空渐变 + 日月光球 + 光带（纯 CSS） */}
      <div class="pt-layer pt-far">
        <div class="pt-sky"></div>
        <div class="pt-orb"></div>
        <div class="pt-aurora">
          <i class="pt-band pt-band-a"></i>
          <i class="pt-band pt-band-b"></i>
          <i class="pt-band pt-band-c"></i>
        </div>
      </div>
      {/* 中景：云海 / 极光（低分辨率 canvas） */}
      <div class="pt-layer pt-mid">
        <canvas class="pt-canvas pt-canvas-mid" aria-hidden="true"></canvas>
      </div>
      {/* 近景：花粉 / 星星 + 流星（全分辨率 canvas） */}
      <div class="pt-layer pt-near">
        <canvas class="pt-canvas pt-canvas-near" aria-hidden="true"></canvas>
      </div>
      {/* 噪点防色带 + 柔光晕影 */}
      <div class="pt-grain"></div>
      <div class="pt-vignette"></div>
    </div>
  )
}

/** 门厅右上角日 / 夜切换按钮（逻辑在 portal-theme.inline.ts） */
function ThemeToggle() {
  return (
    <button
      class="portal-themetoggle"
      type="button"
      aria-label="切换日/夜主题"
      title="切换日/夜主题"
    >
      <svg
        class="icon-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      >
        <path d="M20.4 14.2A8.3 8.3 0 0 1 9.8 3.6a8.3 8.3 0 1 0 10.6 10.6z" />
      </svg>
      <svg
        class="icon-sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19" />
      </svg>
    </button>
  )
}

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
  { prefix: "programming", name: "编程学院", desc: "Python · SQL · Web 全栈实践" },
  { prefix: "prerequisites/english", name: "AI 英语", desc: "术语密码与论文阅读" },
  { prefix: "ai", name: "人工智能大类", desc: "ML · DL · NLP · GenAI · RL · 神经网络伴学" },
  { prefix: "adulting", name: "青年大学习", desc: "Adulting · 大学生活、生存技能与长期成长" },
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
  if (!PORTAL_SLUG_SET.has(slug)) return null

  if (slug === "index") {
    // ---------- 第一层：语言选择 ----------
    const chHref = dirRelative("index" as FullSlug, "ch/index" as FullSlug)
    return (
      <div class="portal portal-lang">
        {SceneLayers()}
        <div class="portal-stage-wrap">
          <div class="portal-stage">
            <h1 class="portal-word">EUTOPIA</h1>
            <p class="portal-tagline">乌托邦之门 · The Gate of Utopia</p>
            <nav class="portal-choices" aria-label="语言选择">
              <a
                class="portal-choice"
                href={chHref}
                data-portal-nav
                data-portal-transition="clouds"
                style={{ "--pt-stagger": "120ms" } as Record<string, string>}
              >
                <span class="portal-choice-glow" aria-hidden="true"></span>
                <span class="portal-choice-main">中 文</span>
                <span class="portal-choice-sub">Chinese</span>
              </a>
              <div class="portal-choice portal-choice-disabled" aria-disabled="true">
                <span class="portal-choice-glow" aria-hidden="true"></span>
                <span class="portal-choice-main">English</span>
                <span class="portal-choice-sub">即将推出 · Coming Soon</span>
              </div>
            </nav>
          </div>
        </div>
        <ThemeToggle />
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

    const menuItems = [
      {
        href: learnHref,
        main: "开 始 学 习",
        sub: "选择一个板块，进入知识世界",
        transition: "clouds",
      },
      { href: roadmapHref, main: "学 习 路 线 图", sub: "先看全局，再启程", transition: "fade" },
      { href: glossaryHref, main: "工 具 箱", sub: "术语表 · 公式卡 · 资源库", transition: "fade" },
      { href: homeHref, main: "传 统 首 页", sub: "以普通网页形式浏览本站", transition: "fade" },
    ]

    return (
      <div class="portal portal-menu">
        {SceneLayers()}
        <a class="portal-back" href={rootHref} data-portal-nav data-portal-transition="fade">
          ← 门厅
        </a>
        <div class="portal-stage-wrap">
          <div class="portal-stage">
            <p class="portal-kicker">EUTOPIA</p>
            <h1 class="portal-title">零基础 AI 学堂</h1>
            <nav class="portal-choices portal-choices-vertical" aria-label="主菜单">
              {menuItems.map((item, i) => (
                <a
                  class="portal-choice"
                  href={item.href}
                  data-portal-nav
                  data-portal-transition={item.transition}
                  style={{ "--pt-stagger": `${550 + i * 120}ms` } as Record<string, string>}
                >
                  <span class="portal-choice-glow" aria-hidden="true"></span>
                  <span class="portal-choice-main">{item.main}</span>
                  <span class="portal-choice-sub">{item.sub}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
        <ThemeToggle />
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
    <div class="portal portal-islands">
      {SceneLayers()}
      <a class="portal-back" href={menuHref} data-portal-nav data-portal-transition="fade">
        ← 主菜单
      </a>
      <div class="portal-stage-wrap">
        <div class="portal-stage">
          <p class="portal-kicker">开始学习</p>
          <h1 class="portal-title">选择你的板块</h1>
          {siteLatest && (
            <p class="portal-updated">知识世界最近更新于 {formatDate(siteLatest, cfg.locale)}</p>
          )}
          <div class="portal-island-grid">
            {stats.map((s, i) => (
              <a
                key={s.href}
                class={`portal-island ${s.pages === 0 ? "portal-island-empty" : ""}`}
                href={s.href}
                data-portal-nav
                data-portal-transition="fade"
                style={{ "--pt-stagger": `${650 + i * 90}ms` } as Record<string, string>}
              >
                <span class="portal-island-glow" aria-hidden="true"></span>
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
      <ThemeToggle />
    </div>
  )
}

Portal.css = style
Portal.afterDOMLoaded = themeScript + "\n" + sceneScript + "\n" + menuScript

export default (() => Portal) satisfies QuartzComponentConstructor
