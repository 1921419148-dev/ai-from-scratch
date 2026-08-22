/**
 * 全站悬浮音乐播放器脚本
 *
 * - 曲目清单内联在脚本里（构建时已知，无需运行时 fetch 目录）
 * - <audio> 元素挂载后由 micromorph 的 data-persist 机制保留，SPA 切页不断播
 * - localStorage 记住音量与上次的曲目/进度，刷新后可续播（不自动播放：浏览器策略禁止）
 */

interface Track {
  /** 文件名（不含扩展名），位于 /static/music/ */
  file: string
  /** 显示名 */
  title: string
}

const TRACKS: Track[] = [
  { file: "01-zeta", title: "Zeta" },
  { file: "02-heartbeat", title: "Heartbeat" },
  { file: "03-sixes", title: "Sixes" },
  { file: "04-eulers-clock", title: "Euler's Clock" },
  { file: "05-one-two-zeta", title: "One, Two, Zeta" },
  { file: "06-grants-etude", title: "Grant's Etude" },
  { file: "07-grants-new-etude", title: "Grant's New Etude" },
  { file: "08-grants-opus", title: "Grant's Opus" },
  { file: "09-the-wallis-ballade", title: "The Wallis Ballade" },
  { file: "10-stepwise", title: "Stepwise" },
  { file: "11-quaternions", title: "Quaternions" },
  { file: "12-reflections", title: "Reflections" },
  { file: "13-resonance", title: "Resonance" },
  { file: "14-serendipity", title: "Serendipity" },
  { file: "15-trinkets", title: "Trinkets" },
  { file: "16-hypothesis", title: "Hypothesis" },
  { file: "17-wading", title: "Wading" },
  { file: "18-centroid", title: "Centroid" },
  { file: "19-spirals", title: "Spirals" },
  { file: "20-endpoint", title: "Endpoint" },
  { file: "21-fractals", title: "Fractals" },
  { file: "22-occlusion", title: "Occlusion" },
  { file: "23-fives", title: "Fives" },
  { file: "24-transformation", title: "Transformation" },
  { file: "25-clarity", title: "Clarity" },
  { file: "26-focal-point", title: "Focal Point" },
  { file: "27-fragments", title: "Fragments" },
  { file: "28-gnomon", title: "Gnomon" },
  { file: "29-orbit", title: "Orbit" },
  { file: "30-far-away", title: "Far Away" },
  { file: "31-quantum-blue", title: "Quantum Blue" },
  { file: "32-machinery", title: "Machinery" },
  { file: "33-the-3blue1brown-experience", title: "The 3Blue1Brown Experience" },
]

const LS_KEY = "music-player-state"

function formatTime(sec: number): string {
  if (!Number.isFinite(sec)) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function loadSaved(): { track: number; time: number; volume: number } | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(partial: Partial<{ track: number; time: number; volume: number }>) {
  try {
    const cur = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}")
    localStorage.setItem(LS_KEY, JSON.stringify({ ...cur, ...partial }))
  } catch {
    // ignore quota errors
  }
}

function setupPlayer(root: HTMLElement) {
  if (root.dataset.initialized === "true") return
  root.dataset.initialized = "true"

  const audio = document.createElement("audio")
  audio.preload = "none"
  root.appendChild(audio)

  const panel = root.querySelector<HTMLElement>(".music-panel")!
  const playlist = root.querySelector<HTMLUListElement>(".music-playlist")!
  const toggle = root.querySelector<HTMLButtonElement>(".music-toggle")!
  const playBtn = root.querySelector<HTMLButtonElement>(".music-play")!
  const prevBtn = root.querySelector<HTMLButtonElement>(".music-prev")!
  const nextBtn = root.querySelector<HTMLButtonElement>(".music-next")!
  const listBtn = root.querySelector<HTMLButtonElement>(".music-list-btn")!
  const seek = root.querySelector<HTMLInputElement>(".music-seek")!
  const titleEl = root.querySelector<HTMLElement>(".music-title")!
  const noEl = root.querySelector<HTMLElement>(".music-track-no")!
  const curEl = root.querySelector<HTMLElement>(".music-time-cur")!
  const totalEl = root.querySelector<HTMLElement>(".music-time-total")!

  let current = 0

  // 构建曲目列表 DOM
  TRACKS.forEach((t, i) => {
    const li = document.createElement("li")
    const btn = document.createElement("button")
    btn.textContent = `${String(i + 1).padStart(2, "0")} ${t.title}`
    btn.addEventListener("click", () => {
      play(i, true)
      playlist.hidden = !playlist.hidden
    })
    li.appendChild(btn)
    playlist.appendChild(li)
  })
  const items = Array.from(playlist.querySelectorAll("button"))

  function highlight() {
    items.forEach((b, i) => b.classList.toggle("active", i === current))
  }

  function load(i: number) {
    current = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length
    const t = TRACKS[current]
    audio.src = `/static/music/${t.file}.mp3`
    titleEl.textContent = t.title
    noEl.textContent = `${current + 1} / ${TRACKS.length}`
    highlight()
    saveState({ track: current, time: 0 })
  }

  function play(i?: number, autoplay = true) {
    if (i !== undefined && i !== current) load(i)
    if (autoplay) {
      audio.play().catch(() => {
        // 自动播放被浏览器拦截时静默失败，等用户手动点播放
      })
    }
  }

  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden
  })

  playBtn.addEventListener("click", () => {
    if (!audio.src) {
      const saved = loadSaved()
      if (saved && saved.track > 0) {
        load(saved.track)
        audio.currentTime = saved.time || 0
      } else {
        load(0)
      }
    }
    if (audio.paused) {
      play()
    } else {
      audio.pause()
    }
  })

  prevBtn.addEventListener("click", () => play(current - 1))
  nextBtn.addEventListener("click", () => play(current + 1))

  listBtn.addEventListener("click", () => {
    playlist.hidden = !playlist.hidden
  })

  let seeking = false
  seek.addEventListener("input", () => {
    seeking = true
    const pct = Number(seek.value) / 1000
    curEl.textContent = formatTime((audio.duration || 0) * pct)
  })
  seek.addEventListener("change", () => {
    const pct = Number(seek.value) / 1000
    if (audio.duration) audio.currentTime = audio.duration * pct
    seeking = false
  })

  audio.addEventListener("timeupdate", () => {
    if (!seeking && audio.duration) {
      seek.value = String(Math.round((audio.currentTime / audio.duration) * 1000))
      curEl.textContent = formatTime(audio.currentTime)
      // 每 10 秒存一次进度
      if (Math.floor(audio.currentTime) % 10 === 0) saveState({ track: current, time: audio.currentTime })
    }
  })

  audio.addEventListener("loadedmetadata", () => {
    totalEl.textContent = formatTime(audio.duration)
  })

  audio.addEventListener("play", () => root.classList.add("playing"))
  audio.addEventListener("pause", () => root.classList.remove("playing"))
  audio.addEventListener("ended", () => play(current + 1))

  // 恢复音量设置（audio.volume 默认 1，无需额外 UI）
  const saved = loadSaved()
  if (saved?.track) {
    noEl.textContent = `上次听到第 ${saved.track + 1} 首`
    titleEl.textContent = TRACKS[saved.track]?.title ?? ""
    current = saved.track
    highlight()
  }
}

document.addEventListener("nav", () => {
  const players = document.querySelectorAll<HTMLElement>(".music-player[data-persist]")
  for (const p of players) setupPlayer(p)
})
