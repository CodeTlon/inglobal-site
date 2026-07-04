'use server'

import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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
}

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

/**
 * Upsert de una clave en site_settings.
 * Primer arg = key (string, prefijado via .bind(null, key) desde el cliente).
 * Segundo arg = prevState (inyectado por useFormState).
 * Tercer arg = formData con el valor JSON del campo `value`.
 */
export async function updateSiteSettings(
  key: string,
  prevState: unknown,
  formData: FormData,
): Promise<SaveState> {
  try {
    const supabase = await requireUser()
    const rawValue = String(formData.get('value') ?? '').trim()

    if (!key) return { error: 'Clave de configuración requerida.' }

    let value: unknown
    try {
      value = JSON.parse(rawValue)
    } catch {
      return { error: 'El valor debe ser JSON válido.' }
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

function extractStoragePath(url: string): string | null {
  // URLs de Supabase Storage: .../storage/v1/object/public/media/<path>
  const match = url.split('#')[0].match(/\/storage\/v1\/object\/public\/media\/(.+)/)
  return match?.[1] ?? null
}

const MAX_IMAGE_BYTES = 12 * 1024 * 1024  // 12 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024  // 50 MB

/**
 * Sube un archivo al bucket `media`.
 * - Imágenes rasterizadas: resize ≤2000px + WebP q=82 via sharp.
 * - video/mp4: validación de tamaño y tipo únicamente, sin transformación.
 * - SVG / GIF: se suben tal cual (sin optimización).
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

    if (isVideo && file.size > MAX_VIDEO_BYTES) return { error: 'El video no puede superar 50 MB.' }
    if (!isVideo && file.size > MAX_IMAGE_BYTES) return { error: 'La imagen no puede superar 12 MB.' }

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
