// Copies the ONNX Runtime Web engine that transformers.js runs on into public/onnx/, so editors'
// browsers load it from our own domain instead of a CDN (ADR-0016). Runs before dev and build;
// the files are generated (~28 MB), not committed, and always match the installed version.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = path.join(ROOT, 'public', 'onnx')
// The build transformers.js loads in the browser (see ONNX_RUNTIME_FILES in the player editor).
const FILES = ['ort-wasm-simd-threaded.jsep.mjs', 'ort-wasm-simd-threaded.jsep.wasm']

// onnxruntime-web is a dependency of transformers.js, not of ours: resolve it from there.
const require = createRequire(import.meta.url)
const fromTransformers = createRequire(require.resolve('@huggingface/transformers'))
const runtimeDir = path.dirname(fromTransformers.resolve('onnxruntime-web'))
const source = existsSync(path.join(runtimeDir, FILES[0]))
  ? runtimeDir
  : path.join(runtimeDir, '..', 'dist')

mkdirSync(TARGET, { recursive: true })
for (const file of FILES) {
  copyFileSync(path.join(source, file), path.join(TARGET, file))
}
process.stdout.write(`ONNX Runtime Web copied to public/onnx (${FILES.length} files)\n`)
