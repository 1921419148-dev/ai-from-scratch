// @ts-ignore
import playerScript from "./scripts/musicplayer.inline"
import styles from "./styles/musicplayer.scss"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

/**
 * MusicPlayer — 全站悬浮音乐播放器
 *
 * 播放 quartz/static/music/ 下的 3Blue1Brown 配乐（Vincent Rubinetti 作曲），
 * 支持播放/暂停、上一首/下一首、曲目列表、进度条、音量与记忆播放位置。
 * SPA 路由切换时通过 data-persist 保持播放不中断。
 *
 * 版权说明：该专辑可免费试听/下载（vincentrubinetti.com/audio/3blue1brown/），
 * 在教育类项目中使用需按作者要求署名，见页面内「关于」提示。
 */
const MusicPlayer: QuartzComponent = () => {
  return (
    <div class="music-player" data-persist="">
      <button class="music-toggle" aria-label="背景音乐" title="背景音乐">
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
          <path d="M9 18V5l12-2v13" />
          <circle class="music-note-dot-1" cx="6" cy="18" r="3" />
          <circle class="music-note-dot-2" cx="18" cy="16" r="3" />
        </svg>
      </button>

      <div class="music-panel" hidden>
        <div class="music-panel-head">
          <span class="music-title">未在播放</span>
          <span class="music-track-no"></span>
        </div>
        <input class="music-seek" type="range" min="0" max="1000" value="0" aria-label="播放进度" />
        <div class="music-time">
          <span class="music-time-cur">0:00</span>
          <span class="music-time-total">0:00</span>
        </div>
        <div class="music-controls">
          <button class="music-prev" aria-label="上一首" title="上一首">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 20 9 12l10-8v16zM7 19V5H5v14h2z" />
            </svg>
          </button>
          <button class="music-play" aria-label="播放" title="播放/暂停">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="music-icon-play"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="music-icon-pause"
            >
              <path d="M6 19h4V5H6v14zM14 5v14h4V5h-4z" />
            </svg>
          </button>
          <button class="music-next" aria-label="下一首" title="下一首">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 4l10 8-10 8V4zM17 5v14h2V5h-2z" />
            </svg>
          </button>
          <button class="music-list-btn" aria-label="曲目列表" title="曲目列表">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
          </button>
        </div>
        <ul class="music-playlist" hidden></ul>
        <p class="music-credit">🎵 The Music of 3Blue1Brown · Vincent Rubinetti</p>
      </div>
    </div>
  )
}

MusicPlayer.afterDOMLoaded = playerScript
MusicPlayer.css = styles

export default (() => MusicPlayer) satisfies QuartzComponentConstructor
