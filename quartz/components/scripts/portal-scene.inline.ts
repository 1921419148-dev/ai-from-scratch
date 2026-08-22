/**
 * Portal 场景渲染：canvas 星尘粒子 + 光柱 + 视差微动
 *
 * - 仅在门厅页激活（Portal.tsx 已做 slug 门控）
 * - 尊重 prefers-reduced-motion：减动效用户只渲染一帧静态星空
 * - document.hidden 时暂停 rAF；移动端降粒子数
 */

const SCENE_SLUGS = new Set(["index", "ch/index", "ch/learn/index"])

interface Mote {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  phase: number
  alpha: number
}

function initScene(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const isMobile = window.matchMedia("(max-width: 768px)").matches
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  let width = 0
  let height = 0
  let motes: Mote[] = []
  let rafId: number | null = null
  let running = false

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = rect.width
    height = rect.height
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    seed()
    if (reducedMotion) drawFrame(0)
  }

  function seed() {
    const count = isMobile ? 45 : 110
    motes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 2.2,
      speed: 6 + Math.random() * 18, // px/s 向上漂浮
      drift: (Math.random() - 0.5) * 10,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.25 + Math.random() * 0.55,
    }))
  }

  function drawFrame(t: number) {
    ctx!.clearRect(0, 0, width, height)

    // 光柱（仅第一层的 EUTOPIA 氛围）：两道极淡的斜光
    const isLangPage = document.body.dataset.slug === "index"
    if (isLangPage && !reducedMotion) {
      const beam = ctx!.createLinearGradient(width * 0.5, 0, width * 0.35, height)
      beam.addColorStop(0, "rgba(255, 226, 168, 0.10)")
      beam.addColorStop(1, "rgba(255, 226, 168, 0)")
      ctx!.fillStyle = beam
      ctx!.beginPath()
      ctx!.moveTo(width * 0.52, 0)
      ctx!.lineTo(width * 0.72, 0)
      ctx!.lineTo(width * 0.42, height)
      ctx!.lineTo(width * 0.28, height)
      ctx!.closePath()
      ctx!.fill()
    }

    // 星尘
    for (const m of motes) {
      const y = reducedMotion ? m.y : (m.y - (m.speed * t) / 1000 + height * 2) % height
      const x = m.x + (reducedMotion ? 0 : Math.sin(t / 1400 + m.phase) * m.drift)
      const twinkle = 0.55 + 0.45 * Math.sin(t / 900 + m.phase * 3)
      const a = m.alpha * twinkle
      ctx!.beginPath()
      ctx!.arc(x, y, m.r, 0, Math.PI * 2)
      ctx!.fillStyle = `rgba(255, 238, 200, ${a.toFixed(3)})`
      ctx!.fill()
    }
  }

  let start = performance.now()
  function loop(now: number) {
    if (!running) return
    drawFrame(now - start)
    rafId = requestAnimationFrame(loop)
  }

  function startLoop() {
    if (running || reducedMotion) return
    running = true
    start = performance.now()
    rafId = requestAnimationFrame(loop)
  }

  function stopLoop() {
    running = false
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  resize()
  window.addEventListener("resize", resize)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop()
    else startLoop()
  })

  if (!reducedMotion) startLoop()

  // 清理：SPA 离开门厅页时停止
  return () => {
    stopLoop()
    window.removeEventListener("resize", resize)
  }
}

function setupPortalScenes() {
  const slug = document.body.dataset.slug ?? ""
  if (!SCENE_SLUGS.has(slug)) return

  for (const canvas of document.querySelectorAll<HTMLCanvasElement>(".portal-canvas")) {
    const cleanup = initScene(canvas)
    if (cleanup) window.addCleanup(cleanup)
  }
}

document.addEventListener("nav", setupPortalScenes)
