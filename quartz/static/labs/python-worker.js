let ready

async function getRuntime(packages) {
  if (!ready) {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js")
    ready = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/" })
  }
  const pyodide = await ready
  if (packages.length) await pyodide.loadPackage(packages)
  return pyodide
}

self.onmessage = async ({ data }) => {
  const output = []
  try {
    const pyodide = await getRuntime(data.packages || [])
    pyodide.setStdout({ batched: (value) => output.push(value) })
    pyodide.setStderr({ batched: (value) => output.push(value) })
    const started = performance.now()
    await pyodide.runPythonAsync(data.code)
    self.postMessage({ ok: true, output: output.join("\n"), duration: performance.now() - started })
  } catch (error) {
    self.postMessage({ ok: false, output: output.join("\n"), error: String(error) })
  }
}
