import { friendlyError } from '@/lib/friendly-error'
import { getTranscodeUploadInfo } from '@/app/actions/transcode'

/**
 * Sube un archivo al bucket `media` desde el navegador pasando por
 * POST /api/storage/upload (no por un Server Action, que tiene su propio tope
 * de body). Usado para video/PDF y para el editor de contenido.
 */
export async function uploadDirectToStorage(
  file: File,
  folder: string,
): Promise<{ url?: string; error?: string }> {
  const body = new FormData()
  body.append('file', file)
  body.append('folder', folder)
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
 * Sube un video pasando primero por el servicio de transcode del VPS
 * (services/video-transcode) — recomprime H.264 CRF20 sin audio antes de
 * guardarlo en el bucket. Si el servicio no está configurado, no responde o
 * el token vence, cae a `uploadDirectToStorage` (sube el video tal cual,
 * mismo comportamiento que antes de este servicio existir) — nunca bloquea
 * la subida por un problema del VPS.
 */
export async function uploadVideoWithTranscode(
  file: File,
  folder: string,
): Promise<{ url?: string; error?: string }> {
  const info = await getTranscodeUploadInfo().catch(() => null)
  if (!info) return uploadDirectToStorage(file, folder)

  const body = new FormData()
  body.append('file', file)
  body.append('folder', folder)

  let res: Response
  try {
    res = await fetch(`${info.url}/transcode`, {
      method: 'POST',
      headers: { 'x-transcode-token': info.token },
      body,
    })
  } catch {
    return uploadDirectToStorage(file, folder)
  }

  if (!res.ok) return uploadDirectToStorage(file, folder)

  const data = await res.json().catch(() => null)
  if (!data?.url) return uploadDirectToStorage(file, folder)
  return { url: data.url }
}
