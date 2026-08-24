/**
 * Portal 过场动画：云层穿越 / 淡入淡出 → SPA 导航
 *
 * - 带 data-portal-nav 的链接点击后先播过场再调 window.spaNavigate
 * - data-portal-transition="clouds"：多层云雾从四周汇聚覆盖屏幕（~1050ms）
 * - data-portal-transition="fade"：320ms 快速淡入淡出
 * - prefers-reduced-motion：全部降级为 200ms 淡出
 * - 遮罩层带 data-persist，SPA morph 时不会被移除（揭幕动画完整播放）
 * - 幕布 / 云团颜色读自 portal.scss 的 --pt-* token，随主题变化
 */

;(() => {
  interface Cloud {
    x: number
    y: number
    r: number
    delay: number
  }

  const MENU_SLUGS = new Set(["index", "ch/index", "ch/learn/index"])

  let transitioning = false

  /** 读当前主题下的 token 颜色（读不到时回退深色幕布） */
  function tokenVar(portalEl: HTMLElement | null, name: string, fallback: string): string {
    if (portalEl) {
      const v = getComputedStyle(portalEl).getPropertyValue(name).trim()
      if (v) return v
    }
    return fallback
  }

  function buildCloudLayer(puffCore: string, puffEdge: string, veil: string): HTMLDivElement {
    const layer = document.createElement("div")
    layer.className = "portal-transition-layer"
    layer.dataset.persist = ""
    layer.style.background = veil

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
      puff.style.background = `radial-gradient(circle at 40% 40%, ${puffCore}, ${puffEdge} 55%, transparent 72%)`
      layer.appendChild(puff)
    }
    const flash = document.createElement("div")
    flash.className = "portal-flash"
    layer.appendChild(flash)
    return layer
  }

  function navigateWithTransition(href: string, mode: string) {
    if (transitioning) return
    transitioning = true

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const portalEl = document.querySelector<HTMLElement>(".portal")
    const veil = tokenVar(portalEl, "--pt-veil", "#0b1020")

    let layer: HTMLDivElement
    let wait: number

    if (reducedMotion || mode === "fade") {
      layer = document.createElement("div")
      layer.className = reducedMotion ? "portal-veil-fast" : "portal-veil-fade"
      layer.dataset.persist = ""
      layer.style.background = veil
      wait = reducedMotion ? 200 : 320
    } else {
      // clouds：云层汇聚 → 白闪 → 导航
      layer = buildCloudLayer(
        tokenVar(portalEl, "--pt-puff-core", "rgba(252,244,228,0.95)"),
        tokenVar(portalEl, "--pt-puff-edge", "rgba(233,216,192,0.5)"),
        veil,
      )
      wait = 740 // 总时长 1050ms 的 ~0.70 处导航
    }

    document.body.appendChild(layer)

    setTimeout(() => {
      const url = new URL(href, window.location.href)
      if (typeof window.spaNavigate === "function") {
        window.spaNavigate(url)
      } else {
        window.location.assign(url)
      }
    }, wait)

    // 导航完成后揭幕（新页面已渲染）；morph 可能已把层摘除，先判 isConnected
    const revealDelay = wait + 350
    setTimeout(() => {
      transitioning = false
      if (!layer.isConnected) return
      layer.classList.add("portal-transition-out")
      setTimeout(() => layer.remove(), 750)
    }, revealDelay)
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
        navigateWithTransition(href, el.dataset.portalTransition ?? "fade")
      }

      el.addEventListener("click", onClick, { capture: true })
      window.addCleanup(() => el.removeEventListener("click", onClick, { capture: true }))
    }
  }

  document.addEventListener("nav", setupPortalMenu)
})()
