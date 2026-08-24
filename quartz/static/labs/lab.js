import { lessonMap, lessons, MANIFEST_VERSION } from "./manifest.js"
import { clearProgress, readProgress, writeProgress } from "./progress.js"

const params = new URLSearchParams(location.search)
const lesson = lessonMap.get(params.get("lesson"))
const editor = document.querySelector("#editor")
const output = document.querySelector("#output")
const preview = document.querySelector("#preview")
const runButton = document.querySelector("#run")
const status = document.querySelector("#status")
const check = document.querySelector("#check")
let pythonWorker
let sqlDb
let gitContext

function sendHeight() {
  parent.postMessage(
    { type: "code-lab-height", height: document.documentElement.scrollHeight },
    "*",
  )
}

function restore() {
  const saved = lesson && readProgress(localStorage, lesson.id)
  editor.value = saved?.code ?? lesson.files[0].content
  if (saved?.completed) checkResult(saved.output || "", true)
}

function save(completed = false, result = "") {
  writeProgress(localStorage, lesson.id, { code: editor.value, completed, output: result })
}

function checkResult(result, restored = false) {
  const passed = lesson.checks.every((item) => `${editor.value}\n${result}`.includes(item))
  check.textContent = passed
    ? restored
      ? "已恢复：本课练习已完成"
      : "检查通过，本课已完成"
    : "还差一点：对照任务要求继续修改"
  check.className = passed ? "pass" : "fail"
  save(passed, result)
  window.dispatchEvent(new CustomEvent("code-lab-progress"))
  return passed
}

function setBusy(value, message = "") {
  runButton.disabled = value
  status.textContent = message || (value ? "正在运行…" : "准备就绪")
}

async function runPython() {
  if (pythonWorker) pythonWorker.terminate()
  pythonWorker = new Worker("./python-worker.js")
  const response = new Promise((resolve, reject) => {
    pythonWorker.onmessage = ({ data }) => resolve(data)
    pythonWorker.onerror = reject
  })
  pythonWorker.postMessage({ code: editor.value, packages: lesson.packages })
  const timeoutMs = lesson.packages.length ? 45000 : 25000
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`运行超过 ${timeoutMs / 1000} 秒，已停止。请检查网络或无限循环。`)),
      timeoutMs,
    ),
  )
  try {
    const result = await Promise.race([response, timeout])
    if (!result.ok) throw new Error(result.error)
    output.textContent = result.output || "（程序运行完成，没有输出）"
    status.textContent = `完成 · ${Math.round(result.duration)} ms`
    checkResult(result.output)
  } finally {
    pythonWorker.terminate()
    pythonWorker = null
  }
}

function seedSql(db) {
  db.run(
    "CREATE TABLE students(id INTEGER PRIMARY KEY, name TEXT, city TEXT, score INTEGER); INSERT INTO students VALUES (1,'小林','北京',95),(2,'小宇','上海',82),(3,'小禾','北京',77); CREATE TABLE courses(id INTEGER PRIMARY KEY,title TEXT); INSERT INTO courses VALUES(1,'Python 入门'),(2,'SQL 基础'); CREATE TABLE enrollments(student_id INTEGER,course_id INTEGER); INSERT INTO enrollments VALUES(1,1),(2,1),(3,2);",
  )
}

async function runSql() {
  if (!sqlDb) {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/${file}`,
    })
    sqlDb = new SQL.Database()
    seedSql(sqlDb)
  }
  const results = sqlDb.exec(editor.value)
  if (!results.length) output.textContent = "语句执行成功，没有返回结果。"
  else
    output.textContent = results
      .map(({ columns, values }) =>
        [
          columns.join(" | "),
          columns.map(() => "---").join(" | "),
          ...values.map((row) => row.join(" | ")),
        ].join("\n"),
      )
      .join("\n\n")
  checkResult(output.textContent)
}

async function getGit() {
  if (!gitContext) {
    const [{ default: git }, { default: LightningFS }] = await Promise.all([
      import("https://esm.sh/isomorphic-git@1.33.1"),
      import("https://esm.sh/@isomorphic-git/lightning-fs@4.6.1"),
    ])
    const fs = new LightningFS(`eutopia-${lesson.id}`, { wipe: true })
    gitContext = { git, fs, pfs: fs.promises, dir: "/repo" }
    await gitContext.pfs.mkdir(gitContext.dir)
  }
  return gitContext
}

async function runGit() {
  const ctx = await getGit()
  const lines = []
  for (const raw of editor.value.split("\n")) {
    const [command, ...args] = raw.trim().split(" ")
    if (!command) continue
    if (command === "init") {
      await ctx.git.init({ fs: ctx.fs, dir: ctx.dir, defaultBranch: "main" })
      lines.push("初始化空仓库")
    } else if (command === "write") {
      const name = args.shift()
      await ctx.pfs.writeFile(`${ctx.dir}/${name}`, args.join(" "), "utf8")
      lines.push(`写入 ${name}`)
    } else if (command === "add") {
      await ctx.git.add({ fs: ctx.fs, dir: ctx.dir, filepath: args[0] })
      lines.push(`暂存 ${args[0]}`)
    } else if (command === "commit") {
      const message = args.join(" ")
      const oid = await ctx.git.commit({
        fs: ctx.fs,
        dir: ctx.dir,
        message,
        author: { name: "Learner", email: "learner@example.invalid" },
      })
      lines.push(`提交 ${oid.slice(0, 7)} ${message}`)
    } else if (command === "status") {
      const matrix = await ctx.git.statusMatrix({ fs: ctx.fs, dir: ctx.dir })
      lines.push(
        ...matrix.map(([name, head, workdir, stage]) => `${name}: ${head}/${workdir}/${stage}`),
      )
    } else if (command === "log") {
      const entries = await ctx.git.log({ fs: ctx.fs, dir: ctx.dir })
      lines.push(...entries.map((x) => `${x.oid.slice(0, 7)} ${x.commit.message}`))
    } else if (command === "branch") {
      await ctx.git.branch({ fs: ctx.fs, dir: ctx.dir, ref: args[0] })
      lines.push(`创建分支 ${args[0]}`)
    } else if (command === "checkout") {
      await ctx.git.checkout({ fs: ctx.fs, dir: ctx.dir, ref: args[0] })
      lines.push(`切换到 ${args[0]}`)
    } else if (command === "diff") {
      const matrix = await ctx.git.statusMatrix({ fs: ctx.fs, dir: ctx.dir })
      lines.push(
        ...matrix
          .filter(([, head, workdir, stage]) => head !== workdir || workdir !== stage)
          .map(
            ([name, head, workdir, stage]) =>
              `${name}: HEAD=${head} 工作区=${workdir} 暂存区=${stage}`,
          ),
      )
      if (!lines.length) lines.push("工作区没有差异")
    } else throw new Error(`不支持的教学命令：${command}`)
  }
  output.textContent = lines.join("\n")
  checkResult(output.textContent)
}

function runWeb() {
  preview.style.display = "block"
  output.style.display = "none"
  let source = editor.value
  if (lesson.runtime === "javascript")
    source = `<pre id="console"></pre><script>(async()=>{const out=[];console.log=(...x)=>{out.push(x.join(' '));document.querySelector('#console').textContent=out.join('\\n')};try{${source}}catch(e){console.log(e)}})()<\/script>`
  if (lesson.runtime === "typescript")
    source = `<pre id="console"></pre><script src="https://cdn.jsdelivr.net/npm/typescript@5.9.2/lib/typescript.js"><\/script><script>const out=[];console.log=(...x)=>{out.push(x.map(v=>typeof v==='object'?JSON.stringify(v):v).join(' '));consoleEl.textContent=out.join('\\n')};const consoleEl=document.querySelector('#console');try{eval(ts.transpile(${JSON.stringify(source)}))}catch(e){console.log(e)}<\/script>`
  if (lesson.runtime === "react")
    source = `<div id="root"></div><script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js"><\/script><script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js"><\/script><script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.28.3/babel.min.js"><\/script><script type="text/babel">${source};ReactDOM.createRoot(document.getElementById('root')).render(<App/>);<\/script>`
  preview.srcdoc = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{font:16px/1.5 system-ui;padding:18px;color:#222}button,input{font:inherit;padding:7px;margin:4px}</style>${source}`
  checkResult("")
}

async function run() {
  setBusy(true)
  preview.style.display = "none"
  output.style.display = "block"
  try {
    if (lesson.runtime === "python") await runPython()
    else if (lesson.runtime === "sql") await runSql()
    else if (lesson.runtime === "git") await runGit()
    else runWeb()
    if (!status.textContent.startsWith("完成")) status.textContent = "运行完成"
  } catch (error) {
    output.textContent = String(error?.message || error)
    check.textContent = "运行失败，代码已自动保存"
    check.className = "fail"
    save(false, output.textContent)
    status.textContent = "运行失败"
  } finally {
    runButton.disabled = false
    sendHeight()
  }
}

if (!lesson) {
  document.body.innerHTML = "<p>找不到这个实验，请检查 lesson 参数。</p>"
} else {
  document.querySelector("#title").textContent = lesson.title
  document.querySelector("#filename").textContent = lesson.files[0].name
  restore()
  editor.addEventListener("input", () => save(false))
  document.querySelector("#run").addEventListener("click", run)
  document.querySelector("#reset").addEventListener("click", () => {
    clearProgress(localStorage, [lesson.id])
    sqlDb = null
    gitContext = null
    editor.value = lesson.files[0].content
    output.textContent = "已恢复默认代码和实验数据。"
    preview.style.display = "none"
    output.style.display = "block"
    check.textContent = ""
    save(false)
  })
  document.querySelector("#clear-all").addEventListener("click", () => {
    if (confirm("清除所有编程学院代码和完成记录？")) {
      clearProgress(
        localStorage,
        lessons.map((item) => item.id),
      )
      restore()
      check.textContent = "全部学习记录已清除"
    }
  })
  window.addEventListener("message", ({ data }) => {
    if (data?.type === "theme")
      document.documentElement.classList.toggle("dark", data.theme === "dark")
  })
  new ResizeObserver(sendHeight).observe(document.body)
  sendHeight()
}
