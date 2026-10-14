import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { resolveStoragePath } from '@/lib/storage'

export const dynamic = 'force-dynamic'

// Solo tipos que el sitio sube (imágenes, video, PDF). Cualquier otra extensión se sirve como
// descarga genérica y con nosniff, nunca como HTML.
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.gif': 'image/gif', '.avif': 'image/avif', '.heic': 'image/heic', '.heif': 'image/heif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
}

/**
 * Sirve los archivos subidos (driver de disco, ver lib/storage.ts) con soporte de Range:
 * los navegadores lo necesitan para reproducir/buscar en video, sobre todo en iOS.
 * Los nombres llevan uuid, así que el contenido de una URL nunca cambia: cache inmutable.
 */
async function serve(request: Request, params: Promise<{ ruta: string[] }>, head: boolean) {
  const { ruta } = await params
  const full = resolveStoragePath(ruta.map(decodeURIComponent).join('/'))
  if (!full) return new Response('Not found', { status: 404 })

  let size: number
  try {
    const st = await fs.stat(full)
    if (!st.isFile()) return new Response('Not found', { status: 404 })
    size = st.size
  } catch {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers({
    'Content-Type': MIME[path.extname(full).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
  })

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '')
  let start = 0
  let end = size - 1
  let status = 200
  if (range && (range[1] || range[2])) {
    if (range[1]) {
      start = Number(range[1])
      if (range[2]) end = Math.min(Number(range[2]), size - 1)
    } else {
      start = Math.max(size - Number(range[2]), 0) // "últimos N bytes"
    }
    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } })
    }
    status = 206
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`)
  }
  headers.set('Content-Length', String(end - start + 1))

  if (head) return new Response(null, { status, headers })
  const stream = Readable.toWeb(createReadStream(full, { start, end })) as ReadableStream
  return new Response(stream, { status, headers })
}

export async function GET(request: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  return serve(request, params, false)
}

export async function HEAD(request: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  return serve(request, params, true)
}
