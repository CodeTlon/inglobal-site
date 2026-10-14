import { friendlyError } from '@/lib/friendly-error'

/**
 * Sube un archivo al bucket `media` desde el navegador pasando por
 * POST /api/storage/upload (no por un Server Action, que tiene su propio tope
 * de body). Usado para video/PDF y para el editor de contenido.
 */
export async function uploadDirectToStorage(
  file: File,
  folder: string,
  opts: { transcode?: 'hero' | 'web' | 'mobile' } = {},
): Promise<{ url?: string; error?: string }> {
  const body = new FormData()
  body.append('file', file)
  body.append('folder', folder)
  // El servidor comprime el video con el servicio global (soft-fail: si no está, guarda el original).
  if (opts.transcode) body.append('transcode', opts.transcode)
  try {
    const res = await fetch('/api/storage/upload', { method: 'POST', body })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return { error: json.error ?? 'No se pudo subir el archivo. Intentá de nuevo.' }
    return { url: json.data.url }
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo subir el archivo. Intentá de nuevo.') }
  }
}

/**
 * Sube un video y deja que el servidor lo comprima con el servicio global de compresión
 * (codetlon-cloud/templates/video-transcode), preset `hero`: H.264 sin audio, hasta 1920 px.
 * Si el servicio no está configurado o falla, se guarda el original — nunca bloquea la subida.
 */
export async function uploadVideoWithTranscode(
  file: File,
  folder: string,
): Promise<{ url?: string; error?: string }> {
  return uploadDirectToStorage(file, folder, { transcode: 'hero' })
}
