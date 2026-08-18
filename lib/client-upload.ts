import { createSupabaseBrowserClient } from '@/lib/supabase'
import { friendlyError } from '@/lib/friendly-error'
import { getTranscodeUploadInfo } from '@/app/actions/transcode'

/**
 * Sube un archivo directo al bucket `media` desde el navegador (bypass del
 * Server Action) — usado para video/PDF, que Vercel rechaza con un 413 crudo
 * si pasan de 4.5MB por la función serverless (ver lib/supabase.ts). El
 * bucket ya tiene RLS que permite INSERT/DELETE a cualquier `authenticated`
 * (supabase/migrations/006_storage_media.sql), que es lo que es cualquier
 * usuario logueado en el panel.
 */
export async function uploadDirectToStorage(
  file: File,
  folder: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = createSupabaseBrowserClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('media')
    .upload(path, file, { contentType: file.type || undefined, upsert: false })
  if (error) return { error: friendlyError(error, 'No se pudo subir el archivo. Intentá de nuevo.') }

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return { url: data.publicUrl }
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
