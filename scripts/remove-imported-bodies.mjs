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
  let text = await readFile(file, "utf8")
  if (!text.includes("\n## 详细说明\n")) continue
  text = text.split("\n## 详细说明\n", 1)[0].trimEnd()
  text +=
    "\n\n## 完成一次行动\n\n选择上面最接近当前问题的一步，在今天完成；记录使用的官方入口、得到的结果和仍需确认的问题。不要用论坛经验代替学校、主管部门或产品官方规则。\n"
  await writeFile(file, text)
}
