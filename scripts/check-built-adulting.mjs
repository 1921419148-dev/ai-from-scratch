import { readFile, readdir, stat } from "node:fs/promises"
import path from "node:path"

const publicRoot = path.resolve("public")
const adultingRoot = path.join(publicRoot, "adulting")

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
      ),
    )
  ).flat()
}

function candidates(pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+/, "")
  return [
    path.join(publicRoot, clean),
    path.join(publicRoot, `${clean}.html`),
    path.join(publicRoot, clean, "index.html"),
  ]
}

const missing = new Set()
for (const file of (await files(adultingRoot)).filter((file) => file.endsWith(".html"))) {
  const html = await readFile(file, "utf8")
  for (const match of html.matchAll(/(?:href|src)=["'](\/adulting\/[^"'#?]*)/g)) {
    const target = match[1]
    let found = false
    for (const candidate of candidates(target)) {
      try {
        if ((await stat(candidate)).isFile()) {
          found = true
          break
        }
      } catch {}
    }
    if (!found) missing.add(target)
  }
  if (/\/qingnian\/ac-wiki\//i.test(html)) throw new Error(`Legacy link emitted by ${file}`)
}

if (missing.size)
  throw new Error(`Missing Adulting build targets:\n${[...missing].sort().join("\n")}`)

for (const legacy of [
  "qingnian/index.html",
  "qingnian/2026-s2/index.html",
  "qingnian/ac-wiki/index.html",
]) {
  try {
    await stat(path.join(publicRoot, legacy))
    throw new Error(`Legacy page still emitted: ${legacy}`)
  } catch (error) {
    if (error.code !== "ENOENT") throw error
  }
}

console.log("Validated built Adulting pages and local assets.")
