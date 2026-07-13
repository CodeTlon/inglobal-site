'use server'

import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { extractStoragePath } from '@/lib/storage'
import { transcodeVideo } from '@/lib/video-transcode'

export type SaveState = { success?: boolean; error?: string } | undefined

// Rutas a revalidar por cada clave de site_settings
const SETTING_PATHS: Record<string, string[]> = {
  hero:               ['/', '/#inicio'],
  stats:              ['/'],
  quienes_somos:      ['/', '/#about'],
  que_hacemos:        ['/', '/#servicios-preview'],
  cta_banner:         ['/'],
  clientes_destacados:['/', '/#clientes-preview'],
  ubicacion:          ['/', '/#ubicacion', '/contacto'],
  footer:             ['/'],
  contacto:           ['/contacto'],
  dashboard_quicklinks: ['/dashboard'],
}

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

/**
 * Los campos de lista (StatsList/StringList/CheckboxGroup) mandan su valor como
 * un string JSON (`[...]`/`{...}`) en un único input; el resto son texto plano.
 */
function parseFieldValue(raw: string): unknown {
  const trimmed = raw.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      // no era JSON después de todo, se guarda como texto
    }
  }
  return raw
}

/**
 * Upsert de una clave en site_settings.
 * Primer arg = key (string, prefijado via .bind(null, key) desde el cliente).
 * Segundo arg = prevState (inyectado por useFormState).
 * Tercer arg = formData con los campos del form — se arma un objeto JSON con
 * todos ellos (cada campo lista ya viene serializado, ver parseFieldValue).
 */
export async function updateSiteSettings(
  key: string,
  prevState: unknown,
  formData: FormData,
): Promise<SaveState> {
  try {
    const supabase = await requireUser()

    if (!key) return { error: 'Clave de configuración requerida.' }

    const value: Record<string, unknown> = {}
    for (const [field, raw] of formData.entries()) {
      if (typeof raw !== 'string') continue
      value[field] = parseFieldValue(raw)
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) return { error: error.message }

    const paths = SETTING_PATHS[key] ?? ['/']
    for (const p of paths) revalidatePath(p)

    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}

// ─────────────────────────────────────────────────────────────
// Upload de media al bucket de Storage
// ─────────────────────────────────────────────────────────────

const MAX_IMAGE_BYTES = 12 * 1024 * 1024  // 12 MB
const MAX_VIDEO_BYTES = 20 * 1024 * 1024  // 20 MB (el server re-comprime, ver lib/video-transcode.ts)
const MAX_DOC_BYTES   = 8 * 1024 * 1024   // 8 MB

/**
 * Sube un archivo al bucket `media`.
 * - Imágenes rasterizadas: resize ≤2000px + WebP q=82 via sharp.
 * - video/mp4: re-encodeado server-side (lib/video-transcode.ts) si el runtime tiene
 *   ffmpeg disponible; si no, se sube tal cual (mismo criterio de fallback del script
 *   de build — nunca rompe el upload por faltar el binario).
 * - SVG / GIF / PDF: se suben tal cual (sin optimización).
 *
 * formData: { file: File, folder: string, oldUrl?: string }
 */
export async function uploadMediaAction(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await requireUser()
    const file = formData.get('file')
    if (!(file instanceof File)) return { error: 'Archivo inválido.' }

    const mime = file.type || ''
    const isVideo = mime === 'video/mp4'
    const isDoc = mime === 'application/pdf'

    if (isVideo && file.size > MAX_VIDEO_BYTES) return { error: 'El video no puede superar 20 MB.' }
    if (isDoc && file.size > MAX_DOC_BYTES) return { error: 'El documento no puede superar 8 MB.' }
    if (!isVideo && !isDoc && file.size > MAX_IMAGE_BYTES) return { error: 'La imagen no puede superar 12 MB.' }

    const folder = String(formData.get('folder') ?? 'uploads')

    // Borrar archivo anterior si viene URL del mismo bucket
    const oldUrl = String(formData.get('oldUrl') ?? '')
    if (oldUrl) {
      const oldPath = extractStoragePath(oldUrl)
      if (oldPath) {
        await supabase.storage.from('media').remove([oldPath])
      }
    }

    const id       = crypto.randomUUID()
    const original = Buffer.from(await file.arrayBuffer())

    const optimizable =
      mime.startsWith('image/') &&
      mime !== 'image/svg+xml'   &&
      mime !== 'image/gif'       &&
      !isVideo

    let buf: Buffer
    let ext: string
    let contentType: string

    if (optimizable) {
      buf = await sharp(original)
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 2 })
        .toBuffer()
      ext         = 'webp'
      contentType = 'image/webp'
    } else if (isVideo) {
      buf         = await transcodeVideo(original)
      ext         = 'mp4'
      contentType = 'video/mp4'
    } else {
      buf         = original
      ext         = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
      contentType = mime || 'application/octet-stream'
    }

    const path = `${folder}/${id}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('media')
      .upload(path, buf, { contentType, upsert: false })
    if (upErr) return { error: upErr.message }

    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return { url: data.publicUrl }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}

/** Borra un archivo del bucket `media` a partir de su URL pública (botón "Quitar" en el dashboard). */
export async function deleteMediaAction(url: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireUser()
    const path = extractStoragePath(url)
    if (!path) return {}
    const { error } = await supabase.storage.from('media').remove([path])
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}
