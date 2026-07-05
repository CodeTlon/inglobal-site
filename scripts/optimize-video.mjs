#!/usr/bin/env node
/**
 * Video pre-optimization pipeline (mismo espíritu que optimize-images.mjs).
 *
 * Lee videos "crudos" desde public/videos/*.{mp4,mov,mkv,webm} (el archivo
 * que mande el cliente puede pesar cualquier cosa, en cualquier codec) y
 * emite una versión web-optimizada en public/videos/opt/: H.264 CRF 20
 * (visualmente sin pérdida), sin audio (los hero videos van siempre muted
 * en loop), tope 1920px de ancho, +faststart para que arranque a reproducir
 * sin esperar el archivo completo. También genera un poster .jpg (primer
 * frame) para usar como fallback/placeholder.
 *
 * Idempotente: sólo re-encodea si el source es más nuevo que el output.
 *
 * ffmpeg es un binario de sistema (no una dependencia de npm) — Vercel no
 * lo tiene en su imagen de build. Por eso el script se corre LOCAL cuando
 * llega el video del cliente (una vez) y el resultado optimizado se commitea;
 * en prebuild simplemente se salta sin fallar si no encuentra el binario.
 *
 * Run con:   npm run optimize:video
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, 'public', 'videos')
const OUT_DIR = path.join(SRC_DIR, 'opt')

const MAX_WIDTH = 1920
const CRF = 20 // ~visualmente lossless para H.264

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    p.stderr.on('data', (d) => (stderr += d))
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(stderr || `${cmd} exit ${code}`))))
  })
}

async function listSources() {
  const entries = await fs.readdir(SRC_DIR, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => /\.(mp4|mov|mkv|webm)$/i.test(n))
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

async function processOne(srcName) {
  const srcPath = path.join(SRC_DIR, srcName)
  const baseName = srcName.replace(/\.[^.]+$/, '')
  const outVideo = path.join(OUT_DIR, `${baseName}.mp4`)
  const outPoster = path.join(OUT_DIR, `${baseName}-poster.jpg`)
  const srcStat = await fs.stat(srcPath)

  if (await isUpToDate(srcStat, [outVideo, outPoster])) {
    return { name: srcName, status: 'skip', srcBytes: srcStat.size, outBytes: 0 }
  }

  // scale sólo si es más ancho que MAX_WIDTH, preservando aspect ratio
  // (-2 fuerza alto par, requisito de H.264 yuv420p).
  const scaleFilter = `scale='min(${MAX_WIDTH},iw)':-2`

  await run('ffmpeg', [
    '-y',
    '-i', srcPath,
    '-vf', scaleFilter,
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-preset', 'slow',
    '-crf', String(CRF),
    '-an', // hero video siempre muted en loop — sacamos el audio entero
    '-movflags', '+faststart',
    outVideo,
  ])

  await run('ffmpeg', ['-y', '-ss', '00:00:00.5', '-i', outVideo, '-frames:v', '1', '-q:v', '3', outPoster])

  const outStat = await fs.stat(outVideo)
  const posterStat = await fs.stat(outPoster)
  return {
    name: srcName,
    status: 'ok',
    srcBytes: srcStat.size,
    outBytes: outStat.size + posterStat.size,
  }
}

async function hasFfmpeg() {
  try {
    await run('ffmpeg', ['-version'])
    return true
  } catch {
    return false
  }
}

async function main() {
  if (!(await hasFfmpeg())) {
    console.log('ffmpeg no está instalado — se salta optimize:video (no falla el build).')
    console.log('Instalalo local (apt/brew install ffmpeg) para re-encodear videos nuevos.')
    return
  }

  await fs.mkdir(OUT_DIR, { recursive: true })

  const sources = await listSources()
  if (sources.length === 0) {
    console.log('No source videos found in', SRC_DIR)
    return
  }

  console.log(`Optimizing ${sources.length} video(s) → ${path.relative(ROOT, OUT_DIR)}\n`)

  for (const name of sources) {
    try {
      const r = await processOne(name)
      const fromMb = (r.srcBytes / 1024 / 1024).toFixed(1)
      const toMb = (r.outBytes / 1024 / 1024).toFixed(1)
      const tag = r.status === 'skip' ? 'skip' : 'ok  '
      console.log(`  ${tag}  ${name.padEnd(24, ' ')} ${fromMb.padStart(7)} MB → ${r.status === 'skip' ? '—' : toMb + ' MB'}`)
    } catch (err) {
      console.error(`  fail  ${name}:`, err.message)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
