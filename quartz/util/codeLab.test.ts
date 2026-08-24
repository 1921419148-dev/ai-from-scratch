import assert from "node:assert/strict"
import { describe, it } from "node:test"

// @ts-ignore Browser modules are plain JavaScript assets tested directly by Node.
import { lessons, lessonMap, MANIFEST_VERSION } from "../static/labs/manifest.js"
// @ts-ignore Browser modules are plain JavaScript assets tested directly by Node.
import { clearProgress, progressKey, readProgress, writeProgress } from "../static/labs/progress.js"

class MemoryStorage {
  values = new Map<string, string>()
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
  removeItem(key: string) {
    this.values.delete(key)
  }
}

describe("Code Lab manifest", () => {
  it("contains unique, valid lessons for every planned runtime", () => {
    assert.equal(lessons.length, 44)
    assert.equal(lessonMap.size, lessons.length)
    assert.deepEqual(
      new Set(lessons.map((item: { runtime: string }) => item.runtime)),
      new Set(["python", "git", "sql", "web", "javascript", "typescript", "react"]),
    )
    for (const item of lessons) {
      assert.ok(item.id && item.track && item.runtime)
      assert.ok(item.files.length > 0)
      assert.ok(
        Array.isArray(item.packages) && Array.isArray(item.checks) && Array.isArray(item.hints),
      )
      assert.ok(item.nextLesson === null || lessonMap.has(item.nextLesson))
    }
  })
})

describe("Code Lab progress", () => {
  it("writes, reads and clears a versioned record", () => {
    const storage = new MemoryStorage()
    writeProgress(storage, "python-first-run", { code: "print(1)", completed: true, output: "1" })
    assert.equal(readProgress(storage, "python-first-run")?.completed, true)
    assert.ok(storage.getItem(progressKey("python-first-run", MANIFEST_VERSION)))
    clearProgress(storage, ["python-first-run"])
    assert.equal(readProgress(storage, "python-first-run"), null)
  })

  it("migrates the legacy unversioned record", () => {
    const storage = new MemoryStorage()
    storage.setItem(
      "eutopia:code-lab:sql-select",
      JSON.stringify({ code: "SELECT 1", completed: true }),
    )
    assert.equal(readProgress(storage, "sql-select")?.version, MANIFEST_VERSION)
    assert.ok(storage.getItem(progressKey("sql-select")))
  })

  it("ignores malformed records without affecting other lessons", () => {
    const storage = new MemoryStorage()
    storage.setItem(progressKey("bad"), "{")
    writeProgress(storage, "good", { code: "print('ok')", completed: false })
    assert.equal(readProgress(storage, "bad"), null)
    assert.equal(readProgress(storage, "good")?.code, "print('ok')")
  })
})
