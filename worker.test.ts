import assert from "node:assert/strict"
import test from "node:test"
import { legacyRedirect } from "./worker.js"

const redirect = (path: string) =>
  legacyRedirect(new URL(path, "https://www.eutopia.wiki"))?.toString()

test("redirects legacy qingnian roots to Adulting", () => {
  assert.equal(redirect("/qingnian"), "https://www.eutopia.wiki/adulting/")
  assert.equal(redirect("/QINGNIAN/"), "https://www.eutopia.wiki/adulting/")
  assert.equal(redirect("/qingnian/2026-s2/lesson-01"), "https://www.eutopia.wiki/adulting/")
})

test("preserves deep Ac-Wiki paths and query parameters", () => {
  assert.equal(
    redirect("/qingnian/ac-wiki/campus-life/library"),
    "https://www.eutopia.wiki/adulting/campus-life/library",
  )
  assert.equal(
    redirect("/QINGNIAN/AC-WIKI/campus-life/library/?from=old"),
    "https://www.eutopia.wiki/adulting/campus-life/library/?from=old",
  )
})

test("ignores unrelated paths", () => {
  assert.equal(redirect("/programming/"), undefined)
})
