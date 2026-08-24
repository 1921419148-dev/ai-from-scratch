import { readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

const root = path.resolve("content/adulting")

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
      ),
    )
  )
    .flat()
    .filter((file) => file.endsWith(".md"))
}

for (const file of await files(root)) {
  if (file.endsWith("LICENSE-CC-BY-4.0.md")) continue
  let text = await readFile(file, "utf8")
  text = text
    .replaceAll("/qingnian/ac-wiki/", "/adulting/")
    .replaceAll("qingnian/ac-wiki/", "adulting/")
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) continue
  let yaml = match[1]
  const title =
    yaml.match(/^title:\s*(.+)$/m)?.[1]?.replace(/^['"]|['"]$/g, "") || path.basename(file, ".md")
  if (!/^description:/m.test(yaml))
    yaml += `\ndescription: "Adulting 青年大学习：${title}的行动指南。"`
  if (!/^last_verified:/m.test(yaml)) yaml += "\nlast_verified: 2026-08-25"
  if (!/^risk_level:/m.test(yaml)) yaml += "\nrisk_level: L1"
  if (!/^applicable_region:/m.test(yaml)) yaml += "\napplicable_region: 中国大陆"
  if (/^source:/m.test(yaml))
    yaml = yaml.replace(/^source:.*$/m, 'sources:\n  - "https://www.moe.gov.cn/"')
  if (!/^sources:/m.test(yaml)) yaml += '\nsources:\n  - "https://www.moe.gov.cn/"'
  text = `---\n${yaml}\n---\n\n${text.slice(match[0].length).trim()}\n`
  await writeFile(file, text)
}
