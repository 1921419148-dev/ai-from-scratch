import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { lessonMap } from "../quartz/static/labs/manifest.js"

const EXPECTED_LABS = 44
const publicRoot = path.resolve("public")

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name)
      return entry.isDirectory() ? htmlFiles(target) : Promise.resolve([target])
    }),
  )
  return files.flat().filter((file) => file.endsWith(".html"))
}

const labs = []
const failures = []

for (const file of await htmlFiles(publicRoot)) {
  const html = await readFile(file, "utf8")
  if (html.includes("lablesson=")) failures.push(`${file}: contains malformed lablesson URL`)

  const iframePattern = /<iframe\b[^>]*\bsrc="([^"]*\/static\/labs\/lab[^"]*)"/g
  for (const match of html.matchAll(iframePattern)) {
    const src = match[1]
    const url = new URL(src, "https://eutopia.invalid/")
    const lessonId = url.searchParams.get("lesson") || decodeURIComponent(url.hash.slice(1))
    labs.push({ file, src, lessonId })
    if (!lessonId) failures.push(`${file}: Code Lab URL is missing a lesson id: ${src}`)
    else if (!lessonMap.has(lessonId)) failures.push(`${file}: unknown lesson id ${lessonId}`)
  }
}

if (labs.length !== EXPECTED_LABS) {
  failures.push(`expected ${EXPECTED_LABS} Code Lab iframes, found ${labs.length}`)
}

if (failures.length) {
  console.error(
    "Code Lab build validation failed:\n" + failures.map((item) => `- ${item}`).join("\n"),
  )
  process.exitCode = 1
} else {
  console.log(`Validated ${labs.length} built Code Lab iframe URLs.`)
}
