/**
 * Portal 过场动画：云层穿越 / 淡入淡出 → SPA 导航
 *
 * - 带 data-portal-nav 的链接点击后先播过场再调 window.spaNavigate
 * - data-portal-transition="clouds"：多层云雾从四周汇聚覆盖屏幕（~900ms）
 * - data-portal-transition="fade"：200ms 快速淡入淡出
 * - prefers-reduced-motion：全部降级为 200ms 淡出
 */

interface Cloud {
  x: number
  y: number
  r: number
  delay: number
}

const MENU_SLUGS = new Set(["index", "ch/index", "ch/learn/index"])

function buildCloudLayer(): HTMLDivElement {
  const layer = document.createElement("div")
  layer.className = "portal-transition-layer"
  const clouds: Cloud[] = []
  const count = window.innerWidth < 768 ? 10 : 16
  for (let i = 0; i < count; i++) {
    // 云团从屏幕外围随机位置涌向中心
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6
    const dist = Math.max(window.innerWidth, window.innerHeight) * (0.65 + Math.random() * 0.3)
    clouds.push({
      x: window.innerWidth / 2 + Math.cos(angle) * dist,
      y: window.innerHeight / 2 + Math.sin(angle) * dist,
      r: 180 + Math.random() * 320,
      delay: Math.random() * 250,
    })
  }
  for (const c of clouds) {
    const puff = document.createElement("div")
    puff.className = "portal-cloud-puff"
    puff.style.left = `${c.x - c.r}px`
    puff.style.top = `${c.y - c.r}px`
    puff.style.width = `${c.r * 2}px`
    puff.style.height = `${c.r * 2}px`
    puff.style.animationDelay = `${c.delay}ms`
    layer.appendChild(puff)
  }
  const flash = document.createElement("div")
  flash.className = "portal-flash"
  layer.appendChild(flash)
  return layer
}

function navigateWithTransition(href: string, mode: string) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const layer = document.createElement("div")

  if (reducedMotion || mode === "fade") {
    layer.className = reducedMotion ? "portal-veil-fast" : "portal-veil-fade"
    document.body.appendChild(layer)
    const wait = reducedMotion ? 200 : 320
    setTimeout(() => window.spaNavigate(new URL(href, window.location.origin)), wait)
    return
  }

  // clouds：云层汇聚 → 白闪 → 导航
  const cloudLayer = buildCloudLayer()
  layer.appendChild(cloudLayer)
  document.body.appendChild(layer)

  const totalTime = 950
  setTimeout(() => {
    window.spaNavigate(new URL(href, window.location.origin))
  }, totalTime * 0.72)

  // 导航完成后揭幕（新页面已渲染）
  setTimeout(() => {
    layer.classList.add("portal-transition-out")
    setTimeout(() => layer.remove(), 700)
  }, totalTime + 350)
}

function setupPortalMenu() {
  const slug = document.body.dataset.slug ?? ""
  if (!MENU_SLUGS.has(slug)) return

  for (const el of document.querySelectorAll<HTMLAnchorElement>("[data-portal-nav]")) {
    const href = el.getAttribute("href")
    if (!href) continue

    const onClick = (e: MouseEvent) => {
      // 允许修饰键默认行为（新标签页等）
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      const mode = el.dataset.portalTransition ?? "fade"
      navigateWithTransition(href, mode)
    }

    el.addEventListener("click", onClick, { capture: true })
    window.addCleanup(() => el.removeEventListener("click", onClick, { capture: true }))
  }
}

document.addEventListener("nav", setupPortalMenu)
