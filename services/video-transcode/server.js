import express from 'express'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { validToken } from './token.js'

const PORT = process.env.PORT || 3000
const SECRET = process.env.TRANSCODE_SHARED_SECRET
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ponytail: tope propio de 200MB, independiente del límite de 20MB que ya
// chequea el navegador (lib/upload-limits.ts) — así el servicio no confía
// ciegamente en un chequeo client-side que se puede saltear.
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 200 * 1024 * 1024 } })

const app = express()

// CORS manual — el navegador pega acá directo desde el dominio de Vercel.
// El token de corta duración ya protege el endpoint, así que el origen no hace falta restringirlo.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'x-transcode-token, content-type')
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/transcode', upload.single('file'), async (req, res) => {
  const token = req.header('x-transcode-token')
  if (!validToken(token, SECRET)) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {})
    return res.status(401).json({ error: 'Token inválido o vencido' })
  }
  if (!req.file) return res.status(400).json({ error: 'Falta el archivo' })

  const folder = (req.body.folder || 'videos').replace(/[^a-z0-9/_-]/gi, '') || 'videos'
  const outPath = path.join(os.tmpdir(), `${crypto.randomUUID()}.mp4`)

  try {
    await transcode(req.file.path, outPath)
    const buffer = await fs.readFile(outPath)
    const storagePath = `${folder}/${crypto.randomUUID()}.mp4`
    const { error } = await supabase.storage
      .from('media')
      .upload(storagePath, buffer, { contentType: 'video/mp4', upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('media').getPublicUrl(storagePath)
    res.json({ url: data.publicUrl })
  } catch (err) {
    console.error('[transcode]', err)
    res.status(500).json({ error: 'No se pudo procesar el video' })
  } finally {
    await fs.unlink(req.file.path).catch(() => {})
    await fs.unlink(outPath).catch(() => {})
  }
})

// Mismo criterio que scripts/optimize-video.mjs / lib/video-transcode.ts del sitio:
// H.264 CRF 20 sin audio, tope 1920px de ancho, +faststart.
function transcode(inPath, outPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-i', inPath,
      '-vf', "scale='min(1920,iw)':-2",
      '-c:v', 'libx264',
      '-crf', '20',
      '-preset', 'medium',
      '-an',
      '-movflags', '+faststart',
      '-y', outPath,
    ]
    const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    p.stderr.on('data', (d) => (stderr += d))
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(stderr || `ffmpeg exit ${code}`))))
  })
}

app.listen(PORT, () => console.log(`video-transcode escuchando en :${PORT}`))
