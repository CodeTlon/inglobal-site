#!/usr/bin/env node
/**
 * Image pre-optimization pipeline.
 *
 * Reads source photos from public/images/*.{webp,png,jpg,jpeg} (skipping
 * logos/ and the brand logo files) and emits AVIF + WebP variants in two
 * sizes (md, lg) into public/images/opt/. The <Picture> component consumes
 * these to serve the best format/size to each client without runtime
 * transformation. Idempotent: only re-encodes when source is newer than
 * any output.
 *
 * Run with:   npm run optimize:images
 * Or auto:    runs before `next build` via the prebuild hook.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, 'public', 'images')
const OUT_DIR = path.join(SRC_DIR, 'opt')
const MANIFEST = path.join(OUT_DIR, 'manifest.json')

// Files / patterns to skip
const SKIP = new Set(['logo.png', 'logo.webp', 'favicon.ico'])
const SKIP_DIRS = new Set(['opt', 'logos'])

const SIZES = [
  { key: 'md', width: 960 },
  { key: 'lg', width: 1920 },
]
const FORMATS = [
  { ext: 'avif', encode: (img) => img.avif({ quality: 65, effort: 6 }) },
  { ext: 'webp', encode: (img) => img.webp({ quality: 85, effort: 6 }) },
]

async function listSources() {
  const entries = await fs.readdir(SRC_DIR, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => /\.(webp|png|jpe?g)$/i.test(n))
    .filter((n) => !SKIP.has(n))
    .filter((n) => !SKIP_DIRS.has(n))
}

async function isUpToDate(srcStat, outputs) {
  for (const out of outputs) {
    try {
      const st = await fs.stat(out)
      if (st.mtimeMs < srcStat.mtimeMs) return false
    } catch {
      return false
    }
  }
  return true
}

function pad(s, n) {
  return String(s).padEnd(n, ' ')
}

async function processOne(srcName) {
  const srcPath = path.join(SRC_DIR, srcName)
  const baseName = srcName.replace(/\.[^.]+$/, '')
  const srcStat = await fs.stat(srcPath)

  const outputs = []
  for (const sz of SIZES) {
    for (const fmt of FORMATS) {
      outputs.push(path.join(OUT_DIR, `${baseName}-${sz.key}.${fmt.ext}`))
    }
  }

  if (await isUpToDate(srcStat, outputs)) {
    return { name: srcName, status: 'skip', srcBytes: srcStat.size, outBytes: 0 }
  }

  const meta = await sharp(srcPath).metadata()
  const origW = meta.width ?? 0
  const origH = meta.height ?? 0
  let outBytes = 0

  for (const sz of SIZES) {
    const targetWidth = Math.min(sz.width, origW || sz.width)
    const pipeline = sharp(srcPath).resize({
      width: targetWidth,
      withoutEnlargement: true,
    })

    for (const fmt of FORMATS) {
      const outPath = path.join(OUT_DIR, `${baseName}-${sz.key}.${fmt.ext}`)
      const buf = await fmt.encode(pipeline.clone()).toBuffer()
      await fs.writeFile(outPath, buf)
      outBytes += buf.length
    }
  }

  return {
    name: srcName,
    status: 'ok',
    srcBytes: srcStat.size,
    outBytes,
    width: origW,
    height: origH,
    baseName,
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })

  const sources = await listSources()
  if (sources.length === 0) {
    console.log('No source images found in', SRC_DIR)
    return
  }

  console.log(`Optimizing ${sources.length} image(s) → ${path.relative(ROOT, OUT_DIR)}\n`)

  const results = []
  for (const name of sources) {
    try {
      const r = await processOne(name)
      results.push(r)
      const fromKb = (r.srcBytes / 1024).toFixed(0)
      const toKb = (r.outBytes / 1024).toFixed(0)
      const tag = r.status === 'skip' ? 'skip' : 'ok  '
      console.log(`  ${tag}  ${pad(name, 18)} ${pad(fromKb + ' KB', 9)} → ${toKb} KB (4 variants)`)
    } catch (err) {
      console.error(`  fail  ${name}:`, err.message)
    }
  }

  // Write manifest with dimensions so <Picture> can supply width/height
  // (prevents CLS). Only updates entries we processed this run.
  let manifest = {}
  try {
    manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'))
  } catch {
    /* first run */
  }
  for (const r of results) {
    if (r.status === 'ok' && r.width && r.height) {
      manifest[r.baseName] = { width: r.width, height: r.height }
    }
  }
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

  const totalIn = results.reduce((s, r) => s + r.srcBytes, 0)
  const totalOut = results.reduce((s, r) => s + r.outBytes, 0)
  console.log(
    `\nTotal source: ${(totalIn / 1024).toFixed(0)} KB  →  output: ${(totalOut / 1024).toFixed(
      0
    )} KB across ${SIZES.length}×${FORMATS.length} variants per image\n`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
