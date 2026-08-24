import { MANIFEST_VERSION } from "./manifest.js"

export function progressKey(lessonId, version = MANIFEST_VERSION) {
  return `eutopia:code-lab:v${version}:${lessonId}`
}

export function readProgress(storage, lessonId) {
  const currentKey = progressKey(lessonId)
  const legacyKey = `eutopia:code-lab:${lessonId}`
  for (const key of [currentKey, legacyKey]) {
    try {
      const value = JSON.parse(storage.getItem(key) || "null")
      if (!value || typeof value.code !== "string") continue
      const migrated = {
        version: MANIFEST_VERSION,
        code: value.code,
        completed: Boolean(value.completed),
        output: typeof value.output === "string" ? value.output : "",
        updatedAt: value.updatedAt || new Date(0).toISOString(),
      }
      if (key !== currentKey) storage.setItem(currentKey, JSON.stringify(migrated))
      return migrated
    } catch {
      return null
    }
  }
  return null
}

export function writeProgress(storage, lessonId, value) {
  const record = {
    version: MANIFEST_VERSION,
    code: value.code,
    completed: Boolean(value.completed),
    output: value.output || "",
    updatedAt: value.updatedAt || new Date().toISOString(),
  }
  storage.setItem(progressKey(lessonId), JSON.stringify(record))
  storage.setItem("eutopia:code-lab:last", lessonId)
  return record
}

export function clearProgress(storage, lessonIds) {
  for (const lessonId of lessonIds) {
    storage.removeItem(progressKey(lessonId))
    storage.removeItem(`eutopia:code-lab:${lessonId}`)
  }
  storage.removeItem("eutopia:code-lab:last")
}
