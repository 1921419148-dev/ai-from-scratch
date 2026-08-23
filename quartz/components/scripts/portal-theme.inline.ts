/**
 * Portal 主题切换按钮
 *
 * 门厅页隐藏了侧栏（Darkmode 按钮所在处），这里提供一个固定在右上角的
 * 小切换钮。点击逻辑与 darkmode.inline.ts 完全一致：翻 saved-theme 属性 →
 * 写 localStorage → 派发 themechange，场景与 CSS token 据此平滑过渡。
 */

const THEME_SLUGS = new Set(["index", "ch/index", "ch/learn/index"])

function setupPortalThemeToggle() {
  const slug = document.body.dataset.slug ?? ""
  if (!THEME_SLUGS.has(slug)) return

  const btn = document.querySelector<HTMLButtonElement>(".portal-themetoggle")
  if (!btn || btn.dataset.ptBound === "true") return
  btn.dataset.ptBound = "true"

  const switchTheme = () => {
    const next = document.documentElement.getAttribute("saved-theme") === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("saved-theme", next)
    localStorage.setItem("theme", next)
    const event: CustomEventMap["themechange"] = new CustomEvent("themechange", {
      detail: { theme: next },
    })
    document.dispatchEvent(event)
  }

  btn.addEventListener("click", switchTheme)
  window.addCleanup(() => btn.removeEventListener("click", switchTheme))
}

document.addEventListener("nav", setupPortalThemeToggle)
