import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import matter from "gray-matter"

async function markdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? markdownFiles(path.join(dir, entry.name))
          : [path.join(dir, entry.name)],
      ),
    )
  )
    .flat()
    .filter((file) => file.endsWith(".md"))
}

test("Adulting content has required metadata and no legacy links", async () => {
  const root = path.resolve("content/adulting")
  const files = await markdownFiles(root)
  assert.ok(files.length >= 82)
  for (const file of files) {
    if (file.endsWith("LICENSE-CC-BY-4.0.md")) continue
    const source = await readFile(file, "utf8")
    const { data, content } = matter(source)
    for (const field of ["title", "description", "last_verified", "risk_level", "sources"])
      assert.ok(data[field], `${file} misses ${field}`)
    assert.match(String(data.risk_level), /^L[123]$/)
    assert.ok(Array.isArray(data.sources) && data.sources.length > 0)
    assert.doesNotMatch(content, /\/qingnian\/ac-wiki\//i)
    if (!file.includes(`${path.sep}credits${path.sep}`)) {
      assert.doesNotMatch(content, /Ac-Wiki|t\.me\/AcFourm|qm\.qq\.com\/q\/WJI3hgBcm4/i)
    }
  }
})

test("Adulting attribution is centralized and reachable", async () => {
  const home = await readFile("content/adulting/index.md", "utf8")
  const credits = await readFile("content/adulting/credits/index.md", "utf8")
  const layout = await readFile("quartz.layout.ts", "utf8")
  assert.match(home, /adulting\/credits\/index/)
  assert.match(layout, /来源与许可: "\/adulting\/credits"/)
  assert.match(credits, /8e58087d8165274650208188fad56aa681a1a0a4/)
  assert.match(credits, /CC BY 4\.0/)
  assert.doesNotMatch(home, /\[\[[^\]]+\|[^\]]+\]\]\s*\|/)
})
