// @ts-ignore
import ttsScript from "./scripts/tts.inline"
import styles from "./styles/tts.scss"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

/**
 * TTSReader — 「听读」按钮组件
 *
 * 使用浏览器内置 speechSynthesis 朗读正文（article 元素内的文本），
 * 支持播放 / 暂停 / 停止，SPA 路由切换时自动停止朗读。
 * 零成本、无需任何外部 API。
 */
const TTSReader: QuartzComponent = () => {
  return (
    <div class="tts-reader" data-persist="">
      <button class="tts-btn" aria-label="朗读本文">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          {/* 喇叭 */}
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path class="tts-wave-1" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path class="tts-wave-2" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
        <span class="tts-label">听读</span>
      </button>
    </div>
  )
}

TTSReader.afterDOMLoaded = ttsScript
TTSReader.css = styles

export default (() => TTSReader) satisfies QuartzComponentConstructor
