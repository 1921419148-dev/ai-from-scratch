/**
 * Portal 场景引擎：双主题（晨曦云海 / 极光夜空）+ 五层视差
 *
 * - 仅在门厅页激活（Portal.tsx 已做 slug 门控）
 * - 色彩全部来自 portal.scss 的 --pt-* token：getComputedStyle 读取后逐帧 lerp，
 *   themechange 时 ~600ms 平滑交叉淡化，JS 不写死颜色
 * - 中景 canvas 内部低分辨率渲染再放大（云海/极光本来就软，省像素）
 * - 近景 canvas 全 DPR 渲染（星点/花粉要锐利）
 * - 视差：指针驱动 + 闲置时自主漂移（触屏设备永远漂移），单 rAF 循环
 * - prefers-reduced-motion：只画一帧静态合成图，themechange 时重绘该帧
 * - document.hidden 暂停；SPA 离开门厅页经 window.addCleanup 清理
 */

const SCENE_SLUGS = new Set(["index", "ch/index", "ch/learn/index"])

// ---------- 小工具 ----------

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

/** 把 "rgba(r,g,b,a)" / "#rgb..." / "r, g, b" 解析成 [r,g,b] 0-255 数组 */
function parseColor(raw: string): [number, number, number] {
  const m = raw.match(/-?\d+(\.\d+)?/g)
  if (!m || m.length < 3) return [255, 255, 255]
  return [Number(m[0]), Number(m[1]), Number(m[2])]
}

interface PtPalette {
  skyHorizon: [number, number, number]
  orbCore: [number, number, number]
  orbHalo: [number, number, number]
  bandA: [number, number, number]
  bandB: [number, number, number]
  bandC: [number, number, number]
  cloudBack: [number, number, number]
  cloudFront: [number, number, number]
  mote: [number, number, number]
}

type PaletteKey = keyof PtPalette

const PALETTE_VARS: Record<PaletteKey, string> = {
  skyHorizon: "--pt-sky-horizon",
  orbCore: "--pt-orb-core",
  orbHalo: "--pt-orb-halo",
  bandA: "--pt-band-a",
  bandB: "--pt-band-b",
  bandC: "--pt-band-c",
  cloudBack: "--pt-cloud-back",
  cloudFront: "--pt-cloud-front",
  mote: "--pt-mote",
}

/** 色板 lerp 器：themechange 时把目标色换成新 token 值，每帧指数逼近 → 平滑过渡 */
class PaletteLerp {
  cur: PtPalette
  tgt: PtPalette

  constructor(initial: PtPalette) {
    this.cur = initial
    this.tgt = initial
  }

  static read(portalEl: HTMLElement): PtPalette {
    const cs = getComputedStyle(portalEl)
    const out = {} as PtPalette
    for (const [key, varName] of Object.entries(PALETTE_VARS) as [PaletteKey, string][]) {
      out[key] = parseColor(cs.getPropertyValue(varName))
    }
    return out
  }

  refresh(portalEl: HTMLElement) {
    this.tgt = PaletteLerp.read(portalEl)
    // 首次读取（或静态模式）直接贴上目标
    this.cur = this.tgt
  }

  tick(dtMs: number) {
    const k = 1 - Math.exp((-dtMs / 1000) * 6)
    for (const key of Object.keys(this.cur) as PaletteKey[]) {
      for (let i = 0; i < 3; i++) {
        this.cur[key][i] += (this.tgt[key][i] - this.cur[key][i]) * k
      }
    }
  }

  rgba(key: PaletteKey, alpha: number): string {
    const c = this.cur[key]
    return `rgba(${c[0].toFixed(0)},${c[1].toFixed(0)},${c[2].toFixed(0)},${alpha})`
  }
}

// ---------- 视差控制器 ----------

interface ParallaxLayer {
  el: HTMLElement
  fx: number
  fy: number
}

class ParallaxController {
  private layers: ParallaxLayer[] = []
  private stageWrap: HTMLElement | null = null
  private tx = 0 // 目标 -1..1
  private ty = 0
  private cx = 0 // 当前（lerp 后）
  private cy = 0
  private driftW = 0 // 0=跟随指针 1=自主漂移
  private pointerMode = true
  private lastPointerAt = 0
  private rafId: number | null = null
  private running = false
  private onMove: (e: PointerEvent) => void
  private onLeave: () => void
  private onTouch: () => void

  constructor() {
    this.onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      this.tx = clamp(nx, -1, 1)
      this.ty = clamp(ny, -1, 1)
      this.lastPointerAt = performance.now()
      this.pointerMode = true
    }
    this.onLeave = () => {
      this.pointerMode = false
    }
    this.onTouch = () => {
      this.pointerMode = false // 触屏设备永久走漂移
      window.removeEventListener("touchstart", this.onTouch)
    }
  }

  addLayer(el: HTMLElement, fx: number, fy = fx * 0.7) {
    this.layers.push({ el, fx, fy })
  }

  attachStage(el: HTMLElement | null) {
    this.stageWrap = el
  }

  start() {
    if (this.running) return
    this.running = true
    window.addEventListener("pointermove", this.onMove, { passive: true })
    window.addEventListener("pointerleave", this.onLeave)
    window.addEventListener("touchstart", this.onTouch, { passive: true })
    let prev = performance.now()
    this.rafId = requestAnimationFrame((now) => {
      prev = now
      const loop = (t: number) => {
        if (!this.running) return
        const dt = t - prev
        if (dt >= 8) {
          prev = t
          this.step(t)
        }
        this.rafId = requestAnimationFrame(loop)
      }
      this.rafId = requestAnimationFrame(loop)
    })
  }

  stop() {
    this.running = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    window.removeEventListener("pointermove", this.onMove)
    window.removeEventListener("pointerleave", this.onLeave)
    window.removeEventListener("touchstart", this.onTouch)
  }

  /** 当前视差量（供近景层内部微偏移复用） */
  offset(): { x: number; y: number } {
    return { x: this.cx, y: this.cy }
  }

  /** 由外部主循环每帧调用；返回是否需要继续 */
  step(now: number): boolean {
    // 指针闲置 >3s → 渐入自主漂移
    const idle = now - this.lastPointerAt > 3000
    const wantDrift = !this.pointerMode || idle ? 1 : 0
    this.driftW += (wantDrift - this.driftW) * 0.02

    // Lissajous 自主漂移曲线（缓慢、不同频率叠加，永不重复感）
    const dx = Math.sin(now / 9000) * 0.55 + Math.sin(now / 23000) * 0.2
    const dy = Math.cos(now / 12000) * 0.45 + Math.cos(now / 27000) * 0.15

    const mx = this.tx * (1 - this.driftW) + dx * this.driftW
    const my = this.ty * (1 - this.driftW) + dy * this.driftW

    this.cx += (mx - this.cx) * 0.065
    this.cy += (my - this.cy) * 0.065

    for (const layer of this.layers) {
      layer.el.style.transform = `translate3d(${(-this.cx * layer.fx).toFixed(2)}px, ${(
        -this.cy * layer.fy
      ).toFixed(2)}px, 0)`
    }

    if (this.stageWrap) {
      this.stageWrap.style.transform = `perspective(1200px) rotateY(${(this.cx * 1.3).toFixed(
        3,
      )}deg) rotateX(${(-this.cy * 1.1).toFixed(3)}deg) translate3d(${(this.cx * 8).toFixed(
        2,
      )}px, ${(this.cy * 6).toFixed(2)}px, 0)`
    }
    return true
  }
}

// ---------- 中景：浅色云海 / 深色极光 ----------

interface Puff {
  x: number
  y: number
  r: number
  speed: number
  phase: number
}

class MidLayer {
  private ctx: CanvasRenderingContext2D
  private w = 0
  private h = 0
  private scale = 1 // 内部低分辨率比例
  private puffs: Puff[] = []
  private mode: "clouds" | "aurora"

  constructor(canvas: HTMLCanvasElement, isMobile: boolean) {
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("no 2d context")
    this.ctx = ctx
    this.mode =
      document.documentElement.getAttribute("saved-theme") === "dark" ? "aurora" : "clouds"
    this.scale = isMobile ? 0.3 : 0.4
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w
    this.h = h
    const cw = (w * this.scale) | 0
    const ch = (h * this.scale) | 0
    this.ctx.canvas.width = Math.max(1, cw * dpr)
    this.ctx.canvas.height = Math.max(1, ch * dpr)
    this.ctx.setTransform(dpr * this.scale, 0, 0, dpr * this.scale, 0, 0)
    this.seed()
  }

  setMode(mode: "clouds" | "aurora") {
    this.mode = mode
  }

  private seed() {
    const rows =
      this.mode === "clouds"
        ? [
            { count: 5, yLo: 0.62, yHi: 0.72, rLo: 110, rHi: 200, speed: -6 },
            { count: 4, yLo: 0.74, yHi: 0.84, rLo: 130, rHi: 240, speed: -10 },
            { count: 3, yLo: 0.86, yHi: 0.96, rLo: 150, rHi: 260, speed: -16 },
          ]
        : [{ count: 6, yLo: 0.05, yHi: 0.85, rLo: 140, rHi: 280, speed: -4 }]
    this.puffs = []
    for (const row of rows) {
      for (let i = 0; i < row.count; i++) {
        this.puffs.push({
          x: Math.random() * this.w,
          y: (row.yLo + Math.random() * (row.yHi - row.yLo)) * this.h,
          r: row.rLo + Math.random() * (row.rHi - row.rLo),
          speed: row.speed * (0.7 + Math.random() * 0.6),
          phase: Math.random() * Math.PI * 2,
        })
      }
    }
  }

  draw(t: number, palette: PaletteLerp, parallax: { x: number; y: number }) {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.w, this.h)

    if (this.mode === "clouds") {
      // 太阳光晕（右上）
      const gx = this.w * 0.78
      const gy = this.h * 0.18
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, this.h * 0.55)
      glow.addColorStop(0, palette.rgba("orbCore", 0.55))
      glow.addColorStop(0.35, palette.rgba("orbHalo", 0.4))
      glow.addColorStop(1, palette.rgba("orbHalo", 0))
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, this.w, this.h)

      // 云海：三排椭圆软团，水平回绕漂移 + 轻微上下浮动
      for (const p of this.puffs) {
        const x = ((p.x + (p.speed * t) / 1000) % (this.w + p.r * 4)) - p.r * 2
        const y = p.y + Math.sin(t / 7000 + p.phase) * 6 - parallax.y * 4
        const g = ctx.createRadialGradient(x, y, 0, x, y, p.r)
        const front = p.speed < -12
        g.addColorStop(0, palette.rgba(front ? "cloudFront" : "cloudBack", front ? 0.9 : 0.65))
        g.addColorStop(1, palette.rgba(front ? "cloudFront" : "cloudBack", 0))
        ctx.save()
        ctx.translate(x, y)
        ctx.scale(1, 0.55)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    } else {
      // 极光带：沿正弦路径撒径向光斑，screen 混合
      ctx.globalCompositeOperation = "screen"
      const bands = [
        { col: "bandA" as PaletteKey, baseY: 0.22, amp: this.h * 0.09, freq: 1.6, speed: 9000 },
        { col: "bandB" as PaletteKey, baseY: 0.34, amp: this.h * 0.07, freq: 2.1, speed: 13000 },
        { col: "bandC" as PaletteKey, baseY: 0.46, amp: this.h * 0.06, freq: 1.2, speed: 17000 },
      ]
      for (const b of bands) {
        const steps = 14
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * this.w
          const wob = Math.sin((i / steps) * Math.PI * b.freq + t / b.speed) * b.amp
          const y = b.baseY * this.h + wob - parallax.y * 8
          const r = this.h * (0.24 + 0.08 * Math.sin(i * 1.7 + t / 6000))
          const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(20, r))
          g.addColorStop(0, palette.rgba(b.col, 0.32))
          g.addColorStop(1, palette.rgba(b.col, 0))
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(x, y, Math.max(20, r), 0, Math.PI * 2)
          ctx.fill()
        }
      }
      // 底部星云薄雾
      const nebula = ctx.createRadialGradient(
        this.w * 0.25,
        this.h * 0.9,
        0,
        this.w * 0.25,
        this.h * 0.9,
        this.h * 0.7,
      )
      nebula.addColorStop(0, palette.rgba("cloudBack", 0.28))
      nebula.addColorStop(1, palette.rgba("cloudBack", 0))
      ctx.fillStyle = nebula
      ctx.fillRect(0, 0, this.w, this.h)
      ctx.globalCompositeOperation = "source-over"
    }
  }
}

// ---------- 近景：花粉 / 星星 + 流星 ----------

interface Mote {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  phase: number
  alpha: number
  gold: boolean
}

class ShootingStar {
  active = false
  x0 = 0
  y0 = 0
  dx = 0
  dy = 0
  born = 0
  life = 900

  spawn(w: number, h: number, now: number) {
    this.active = true
    this.born = now
    this.life = 800 + Math.random() * 400
    this.x0 = w * (0.15 + Math.random() * 0.6)
    this.y0 = h * (0.05 + Math.random() * 0.25)
    const ang = Math.PI * (0.15 + Math.random() * 0.2) // 向左下
    const len = Math.max(w, h) * (0.18 + Math.random() * 0.12)
    this.dx = Math.cos(ang) * len
    this.dy = Math.sin(ang) * len
  }
}

class NearLayer {
  private ctx: CanvasRenderingContext2D
  private w = 0
  private h = 0
  private motes: Mote[] = []
  private shooter = new ShootingStar()
  private nextShootAt = 0

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("no 2d context")
    this.ctx = ctx
  }

  resize(w: number, h: number, dpr: number, isMobile: boolean, reducedMotion: boolean) {
    this.w = w
    this.h = h
    canvasResize(this.ctx, w, h, dpr)
    const dark = document.documentElement.getAttribute("saved-theme") === "dark"
    const base = dark ? 130 : 60
    const count = isMobile ? Math.round(base * 0.45) : base
    this.seed(count)
    if (reducedMotion) this.nextShootAt = Number.POSITIVE_INFINITY
    else this.nextShootAt = performance.now() + 4000 + Math.random() * 5000
  }

  private seed(count: number) {
    this.motes = Array.from({ length: count }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      r: 0.6 + Math.random() * 2.1,
      speed: 5 + Math.random() * 16,
      drift: (Math.random() - 0.5) * 12,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.22 + Math.random() * 0.55,
      gold: Math.random() < 0.12,
    }))
  }

  draw(t: number, dtMs: number, palette: PaletteLerp, parallax: { x: number; y: number }) {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.w, this.h)

    // 粒子
    for (const m of this.motes) {
      const y = (m.y - (m.speed * t) / 1000 + this.h * 2) % this.h
      const x = m.x + Math.sin(t / 1400 + m.phase) * m.drift + parallax.x * 6
      const twinkle = 0.55 + 0.45 * Math.sin(t / 900 + m.phase * 3)
      const a = m.alpha * twinkle
      ctx.beginPath()
      ctx.arc(x, y, m.r, 0, Math.PI * 2)
      ctx.fillStyle = m.gold ? `rgba(255,222,150,${a.toFixed(3)})` : palette.rgba("mote", a)
      ctx.fill()
    }

    // 流星（深浅两模式都可出现，深色更频繁）
    const now = t
    const dark = document.documentElement.getAttribute("saved-theme") === "dark"
    if (!this.shooter.active && now >= this.nextShootAt) {
      this.shooter.spawn(this.w, this.h, now)
      this.nextShootAt = now + (dark ? 6000 : 10000) + Math.random() * (dark ? 6000 : 12000)
    }
    if (this.shooter.active) {
      const s = this.shooter
      const p = clamp((now - s.born) / s.life, 0, 1)
      if (p >= 1) {
        s.active = false
      } else {
        const ease = 1 - Math.pow(1 - p, 3)
        const hx = s.x0 + s.dx * ease
        const hy = s.y0 + s.dy * ease
        const tailX = s.x0 + s.dx * Math.max(0, ease - 0.12)
        const tailY = s.y0 + s.dy * Math.max(0, ease - 0.12)
        const grad = ctx.createLinearGradient(tailX, tailY, hx, hy)
        grad.addColorStop(0, "rgba(255,255,255,0)")
        grad.addColorStop(1, `rgba(255,250,235,${(0.75 * (1 - p)).toFixed(3)})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.6
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(hx, hy)
        ctx.stroke()
      }
    }
    void dtMs
  }
}

function canvasResize(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) {
  ctx.canvas.width = Math.max(1, w * dpr)
  ctx.canvas.height = Math.max(1, h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

// ---------- 主装配 ----------

function initScene(portalRoot: HTMLElement) {
  const midCanvas = portalRoot.querySelector<HTMLCanvasElement>(".pt-canvas-mid")
  const nearCanvas = portalRoot.querySelector<HTMLCanvasElement>(".pt-canvas-near")
  if (!midCanvas || !nearCanvas) return

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const isMobile = window.matchMedia("(max-width: 768px)").matches
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  let width = window.innerWidth
  let height = window.innerHeight

  const palette = new PaletteLerp(PaletteLerp.read(portalRoot))

  let mid: MidLayer
  try {
    mid = new MidLayer(midCanvas, isMobile)
  } catch {
    return
  }
  let near: NearLayer
  try {
    near = new NearLayer(nearCanvas)
  } catch {
    return
  }

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    mid.resize(width, height, dpr)
    near.resize(width, height, dpr, isMobile, reducedMotion)
    if (reducedMotion) drawStatic()
  }

  // 静态合成一帧（reduced-motion 用）：漂移参数固定、t 取定值
  function drawStatic() {
    palette.tick(1000)
    const fixedParallax = { x: 0.2, y: 0.15 }
    mid.draw(42000, palette, fixedParallax)
    near.draw(42000, 16, palette, fixedParallax)
  }

  resize()

  if (!reducedMotion) {
    const parallax = new ParallaxController()
    const farEl = portalRoot.querySelector<HTMLElement>(".pt-far")
    const midEl = midCanvas.closest<HTMLElement>(".pt-layer")
    const nearEl = nearCanvas.closest<HTMLElement>(".pt-layer")
    const stageWrap = portalRoot.querySelector<HTMLElement>(".portal-stage-wrap")
    if (farEl) parallax.addLayer(farEl, 6, 4)
    if (midEl) parallax.addLayer(midEl, 12, 8)
    if (nearEl) parallax.addLayer(nearEl, 18, 12)
    if (stageWrap) parallax.attachStage(stageWrap)

    let running = true
    let start = performance.now()
    let prev = start
    let frame = 0
    let rafId = requestAnimationFrame(loop)

    function loop(now: number) {
      if (!running) return
      frame++
      const dt = now - prev
      prev = now
      palette.tick(dt)
      parallax.step(now)
      const par = parallax.offset()
      const t = now - start
      // 中景在移动端隔帧绘制
      if (!(isMobile && frame % 2 === 0)) mid.draw(t, palette, par)
      near.draw(t, dt, palette, par)
      rafId = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(rafId)
      } else if (!running) {
        running = true
        start = performance.now() - 42000 // 保持 t 连续的近似处理
        prev = performance.now()
        rafId = requestAnimationFrame(loop)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    const cleanup = () => {
      running = false
      cancelAnimationFrame(rafId)
      document.removeEventListener("visibilitychange", onVisibility)
    }
    window.addCleanup(cleanup)
  }

  const onThemeChange = () => {
    palette.refresh(portalRoot)
    if (reducedMotion) drawStatic()
  }
  document.addEventListener("themechange", onThemeChange)

  window.addEventListener("resize", resize)

  window.addCleanup(() => {
    document.removeEventListener("themechange", onThemeChange)
    window.removeEventListener("resize", resize)
  })

  // 中景的模式随主题切换而变（云海 ↔ 极光），切换后重建种子
  const onThemeSwitchRebuild = () => {
    mid.setMode(
      document.documentElement.getAttribute("saved-theme") === "dark" ? "aurora" : "clouds",
    )
    mid.resize(width, height, dpr)
  }
  document.addEventListener("themechange", onThemeSwitchRebuild)
  window.addCleanup(() => document.removeEventListener("themechange", onThemeSwitchRebuild))

  if (reducedMotion) drawStatic()
}

function setupPortalScenes() {
  const slug = document.body.dataset.slug ?? ""
  if (!SCENE_SLUGS.has(slug)) return

  const portalRoot = document.querySelector<HTMLElement>(".portal")
  if (!portalRoot || portalRoot.dataset.ptInit === "true") return
  portalRoot.dataset.ptInit = "true"

  initScene(portalRoot)
}

document.addEventListener("nav", setupPortalScenes)
