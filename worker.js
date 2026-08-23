/**
 * EUTOPIA 站点 Worker：静态资产 + 旧链接 301 跳转
 *
 * assets 绑定（env.ASSETS）承接静态文件；本脚本只处理需要重定向的旧路径，
 * 其余请求原样交给静态资产（包括 404-page 兜底）。
 */

// 旧路径 → 新路径 的 301 映射（门厅改造 AIC-INFRA-004 迁移产生）
const REDIRECTS = {
  "/home": "/ch/home", // 传统首页：content/index.md → content/ch/home.md
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, "") || "/" // 去尾部斜杠归一化

    const target = REDIRECTS[path]
    if (target) {
      return Response.redirect(new URL(target + url.search, request.url), 301)
    }

    return env.ASSETS.fetch(request)
  },
}
