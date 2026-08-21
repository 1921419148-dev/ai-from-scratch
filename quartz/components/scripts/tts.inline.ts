/**
 * TTS 听读脚本
 * - 点击按钮：开始 / 暂停 / 继续朗读正文
 * - 双击或点击「停止」：结束朗读
 * - 监听 Quartz SPA 的 nav 事件，切页自动停止
 */

interface TTSState {
  utterQueue: SpeechSynthesisUtterance[]
  index: number
  playing: boolean
}

let state: TTSState | null = null

function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  state = null
}

/** 从正文中收集要朗读的文本块（按段落/标题/表格单元格切分） */
function collectSegments(): string[] {
  const article = document.querySelector("article")
  if (!article) return []

  // 排除代码块、可折叠答案里的提示文字等不需要朗读的部分由 CSS class 控制：
  // 这里简单按块级元素收集，过滤掉 script/style/代码
  const selector = "h1, h2, h3, h4, h5, h6, p, li, blockquote, td, th"
  const nodes = article.querySelectorAll(selector)
  const segments: string[] = []
  for (const node of nodes) {
    // 跳过代码块内部与隐藏元素
    if (node.closest("pre, code")) continue
    const el = node as HTMLElement
    const style = window.getComputedStyle(el)
    if (style.display === "none" || style.visibility === "hidden") continue

    let text = el.textContent?.trim() ?? ""
    if (!text) continue
    // 去掉公式残留的 latex 定界符，读起来更自然
    text = text.replace(/\\[a-zA-Z]+/g, " ").replace(/[{}$^_]/g, " ")
    // 列表项太碎时合并到前一段
    if (el.tagName === "LI" && segments.length > 0 && segments[segments.length - 1].length < 60) {
      segments[segments.length - 1] += "，" + text
    } else {
      segments.push(text)
    }
  }
  return segments
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null
  // 优先选中文音色
  const zh =
    voices.find((v) => v.lang === "zh-CN") ??
    voices.find((v) => v.lang.startsWith("zh")) ??
    voices.find((v) => v.default)
  return zh ?? voices[0]
}

function playFrom(segments: string[], index: number, button: HTMLButtonElement) {
  stopSpeaking()
  state = { utterQueue: [], index, playing: true }

  const voice = pickVoice()

  const speakNext = (i: number) => {
    if (!state || !state.playing || i >= segments.length) {
      setButtonState(button, "idle")
      stopSpeaking()
      return
    }
    state.index = i
    const utter = new SpeechSynthesisUtterance(segments[i])
    if (voice) utter.voice = voice
    utter.lang = voice?.lang ?? "zh-CN"
    utter.rate = 1.0
    utter.pitch = 1.0
    utter.onend = () => {
      if (state && state.playing) speakNext(i + 1)
    }
    utter.onerror = () => {
      setButtonState(button, "idle")
      stopSpeaking()
    }
    state.utterQueue.push(utter)
    window.speechSynthesis.speak(utter)
  }

  speakNext(index)
  setButtonState(button, "playing")
}

function setButtonState(button: HTMLButtonElement, mode: "idle" | "playing" | "paused") {
  button.dataset.ttsState = mode
  const label = button.querySelector(".tts-label")
  if (label) {
    label.textContent = mode === "playing" ? "暂停" : mode === "paused" ? "继续" : "听读"
  }
}

document.addEventListener("nav", () => {
  // 页面切换时停止朗读
  stopSpeaking()

  const buttons = document.querySelectorAll<HTMLButtonElement>(".tts-btn")
  for (const button of buttons) {
    const onClick = () => {
      if (!("speechSynthesis" in window)) {
        alert("当前浏览器不支持语音朗读（speechSynthesis）")
        return
      }

      const mode = button.dataset.ttsState ?? "idle"
      if (mode === "idle") {
        // 首次调用 getVoices 可能返回空列表，先预热一次
        window.speechSynthesis.getVoices()
        const segments = collectSegments()
        if (segments.length === 0) return
        playFrom(segments, 0, button)
      } else if (mode === "playing") {
        window.speechSynthesis.pause()
        state!.playing = false
        setButtonState(button, "paused")
      } else {
        // paused -> resume
        state!.playing = true
        window.speechSynthesis.resume()
        setButtonState(button, "playing")
      }
    }

    const onDblClick = () => {
      // 双击直接停止
      stopSpeaking()
      setButtonState(button, "idle")
    }

    button.addEventListener("click", onClick)
    button.addEventListener("dblclick", onDblClick)
    window.addCleanup(() => {
      button.removeEventListener("click", onClick)
      button.removeEventListener("dblclick", onDblClick)
    })
  }
})

// 音色列表异步加载完成后再预热缓存
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices()
  }
}

// 把 Quartz 的主题变化广播给页面里的交互 widget（iframe）
document.addEventListener("themechange", (e) => {
  const theme = (e as CustomEvent).detail?.theme
  for (const frame of document.querySelectorAll<HTMLIFrameElement>("iframe.widget-frame")) {
    frame.contentWindow?.postMessage({ type: "theme", theme }, "*")
  }
})
