import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import { basename, join } from "node:path"
import { describe, it } from "node:test"

// @ts-ignore Browser manifest is a plain JavaScript asset tested directly by Node.
import { lessonMap } from "../static/labs/manifest.js"

async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = join(directory, entry.name)
      return entry.isDirectory() ? markdownFiles(target) : Promise.resolve([target])
    }),
  )
  return nested.flat().filter((file) => file.endsWith(".md"))
}

describe("programming curriculum", () => {
  it("contains the planned SQL and Web pages with the teaching contract", async () => {
    const root = join(process.cwd(), "content", "programming")
    const files = await markdownFiles(root)
    assert.equal(files.length, 31)
    const lessonPages = files.filter((file) => basename(file) !== "index.md")
    assert.equal(lessonPages.length, 28)
    for (const file of lessonPages) {
      const content = await readFile(file, "utf8")
      for (const heading of [
        "## 生活场景切入",
        "## 核心概念",
        "## 可运行示例",
        "## 分步任务",
        "## 常见错误",
        "## 挑战题",
        "## 下一步",
      ]) {
        assert.ok(content.includes(heading), `${file} is missing ${heading}`)
      }
      const lessonId = content.match(/\/static\/labs\/lab\?lesson=([\w-]+)/)?.[1]
      assert.ok(lessonId && lessonMap.has(lessonId), `${file} has an invalid lesson id`)
    }
  })

  it("renders SQL and Web course indexes as three-column tables", async () => {
    for (const track of ["sql", "web"]) {
      const content = await readFile(
        join(process.cwd(), "content", "programming", track, "index.md"),
        "utf8",
      )
      const tableLines = content.split("\n").filter((line) => line.startsWith("|"))
      assert.ok(tableLines.length > 2)
      for (const line of tableLines) {
        assert.equal((line.match(/\|/g) ?? []).length, 4, `${track}: malformed table row ${line}`)
      }
      assert.ok(tableLines.every((line) => !line.includes("[[")))
    }
  })

  it("integrates all 16 Python lessons without changing their paths", async () => {
    const root = join(process.cwd(), "content", "prerequisites", "python")
    const files = (await markdownFiles(root)).filter((file) => basename(file) !== "index.md")
    assert.equal(files.length, 16)
    for (const file of files) {
      const content = await readFile(file, "utf8")
      assert.match(content, /^last_verified: 2026-08-\d{2}$/m)
      const lessonId = content.match(/\/static\/labs\/lab\?lesson=([\w-]+)/)?.[1]
      assert.ok(lessonId && lessonMap.has(lessonId), `${file} has an invalid lesson id`)
    }
  })

  it("keeps W3Schools links and the independence notice centralized", async () => {
    const root = join(process.cwd(), "content", "programming")
    const files = await markdownFiles(root)
    const academy = await readFile(join(root, "index.md"), "utf8")
    assert.match(academy, /本站不是 W3Schools 官方合作项目/)
    assert.match(academy, /https:\/\/www\.w3schools\.com\/python\//)
    for (const file of files.filter((item) => basename(item) !== "index.md")) {
      assert.doesNotMatch(await readFile(file, "utf8"), /w3schools\.com/i)
    }
  })
})
