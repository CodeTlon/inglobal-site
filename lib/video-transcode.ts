/**
 * Re-encodeo de video en runtime, mismo criterio que scripts/optimize-video.mjs
 * (H.264 CRF 20 sin audio, tope 1920px, +faststart) pero invocado dentro de un
 * Server Action en vez de un script de build.
 *
 * ffmpeg es un binario de sistema. Hoy (deploy en Vercel) no está disponible, así
 * que esto queda inerte: `transcodeVideo` detecta que no hay binario y devuelve el
 * buffer original sin tocar — el upload sigue funcionando igual que antes, solo sin
 * optimizar. Se activa solo cuando el runtime lo tenga instalado (planeado para
 * cuando el deploy pase a Coolify, ver .claude/CLAUDE.md).
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'

const MAX_WIDTH = 1920
const CRF = 20

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    p.stderr.on('data', (d) => (stderr += d))
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(stderr || `${cmd} exit ${code}`))))
  })
}

let ffmpegAvailable: boolean | null = null
async function hasFfmpeg(): Promise<boolean> {
  if (ffmpegAvailable !== null) return ffmpegAvailable
  try {
    await run('ffmpeg', ['-version'])
    ffmpegAvailable = true
  } catch {
    ffmpegAvailable = false
  }
  return ffmpegAvailable
}

export async function transcodeVideo(input: Buffer): Promise<Buffer> {
  if (!(await hasFfmpeg())) return input

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'igb-video-'))
  const inPath = path.join(tmpDir, 'in')
  const outPath = path.join(tmpDir, 'out.mp4')

  try {
    await fs.writeFile(inPath, input)
    await run('ffmpeg', [
      '-y',
      '-i', inPath,
      '-vf', `scale='min(${MAX_WIDTH},iw)':-2`,
      '-c:v', 'libx264',
      '-profile:v', 'high',
      '-preset', 'slow',
      '-crf', String(CRF),
      '-an',
      '-movflags', '+faststart',
      outPath,
    ])
    return await fs.readFile(outPath)
  } catch {
    // ponytail: si el transcode falla por cualquier motivo (formato raro, etc.),
    // subimos el original en vez de romper el upload del usuario.
    return input
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
}
