import { formatDate } from "./Date"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import style from "./styles/dashboard.scss"

interface SectionDef {
  /** 板块目录前缀，如 "prerequisites/math" */
  prefix: string
  icon: string
  name: string
}

const SECTIONS: SectionDef[] = [
  { prefix: "getting-started", icon: "🚀", name: "入门" },
  { prefix: "prerequisites/math", icon: "📐", name: "数学基础" },
  { prefix: "prerequisites/python", icon: "🐍", name: "Python 编程" },
  { prefix: "prerequisites/english", icon: "🔤", name: "AI 英语" },
  { prefix: "ml", icon: "🤖", name: "机器学习" },
  { prefix: "dl", icon: "🧠", name: "深度学习" },
  { prefix: "nlp", icon: "💬", name: "自然语言处理" },
  { prefix: "genai", icon: "✨", name: "生成式 AI" },
  { prefix: "rl", icon: "🎮", name: "强化学习" },
  { prefix: "qingnian", icon: "🇨🇳", name: "青年大学习" },
]

/** CJK 感知字数：中文字符逐个计数，英文按单词计数 */
function countChars(text: string | undefined): number {
  if (!text) return 0
  const cjk = (text.match(/[\p{Script=Han}぀-ヿ가-힯]/gu) ?? []).length
  const latinWords = text
    .replace(/[\p{Script=Han}぀-ヿ가-힯]/gu, " ")
    .split(/\s+/)
    .filter(Boolean).length
  return cjk + latinWords
}

/** 字数的人话显示：<1000 原数，≥1000 显示「约 X.X 千」 */
function formatCount(n: number): string {
  if (n < 1000) return n === 0 ? "—" : `${n} 字`
  return `约 ${(n / 1000).toFixed(1)} 千字`
}

interface SectionStats {
  def: SectionDef
  pages: number
  chars: number
  latest?: Date
}

function computeStats(allFiles: QuartzPluginData[]): SectionStats[] {
  return SECTIONS.map((def) => {
    const files = allFiles.filter(
      (f) => f.slug?.startsWith(`${def.prefix}/`) && f.slug !== `${def.prefix}/index`,
    )
    let chars = 0
    let latest: Date | undefined = undefined
    for (const f of files) {
      chars += countChars(f.text)
      const d = f.dates?.modified
      if (d && (!latest || d > latest)) latest = d
    }
    return { def, pages: files.length, chars, latest }
  })
}

const Dashboard: QuartzComponent = ({ allFiles, fileData, cfg }: QuartzComponentProps) => {
  // 只在首页渲染（slug 门控）
  if (fileData.slug !== "index") return null

  const stats = computeStats(allFiles)
  const totalPages = stats.reduce((acc, s) => acc + s.pages, 0)
  const totalChars = stats.reduce((acc, s) => acc + s.chars, 0)
  const siteLatest = stats
    .map((s) => s.latest)
    .filter((d): d is Date => d !== undefined)
    .reduce<Date | undefined>((max, d) => (!max || d > max ? d : max), undefined)

  return (
    <div class="dashboard">
      <div class="dashboard-overview">
        <div class="dashboard-stat">
          <span class="dashboard-stat-num">{totalPages}</span>
          <span class="dashboard-stat-label">门课程</span>
        </div>
        <div class="dashboard-stat">
          <span class="dashboard-stat-num">{formatCount(totalChars)}</span>
          <span class="dashboard-stat-label">讲义内容</span>
        </div>
        <div class="dashboard-stat">
          <span class="dashboard-stat-num">
            {siteLatest ? formatDate(siteLatest, cfg.locale) : "—"}
          </span>
          <span class="dashboard-stat-label">最近更新</span>
        </div>
      </div>

      <div class="dashboard-grid">
        {stats.map(({ def, pages, chars, latest }) => {
          const href = resolveRelative("index" as FullSlug, `${def.prefix}/index` as FullSlug)
          return (
            <a class="dashboard-card" href={href}>
              <div class="dashboard-card-head">
                <span class="dashboard-card-icon">{def.icon}</span>
                <span class="dashboard-card-name">{def.name}</span>
              </div>
              <div class="dashboard-card-stats">
                <span class="dashboard-card-pages">{pages > 0 ? `${pages} 篇` : "尚未开课"}</span>
                {pages > 0 && (
                  <>
                    <span class="dashboard-card-sep">·</span>
                    <span>{formatCount(chars)}</span>
                  </>
                )}
              </div>
              <div class="dashboard-card-date">
                {latest ? `更新于 ${formatDate(latest, cfg.locale)}` : " "}
              </div>
            </a>
          )
        })}
      </div>

      <p class="dashboard-note">
        📊 以上统计由构建时自动生成：课程篇数、讲义字数、最近更新日期均实时反映仓库状态。
      </p>
    </div>
  )
}

Dashboard.css = style

export default (() => Dashboard) satisfies QuartzComponentConstructor
