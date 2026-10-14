'use server'

import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import { getSessionUser, getServerDb } from '@/lib/session'
import { friendlyError } from '@/lib/friendly-error'
import { extractStoragePath, putMedia, removeMedia } from '@/lib/storage'
import { transcodeWithService } from '@/lib/transcode-client'
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, MAX_DOC_BYTES } from '@/lib/upload-limits'

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
  servicios_header:   ['/servicios'],
  montajes_header:    ['/montajes'],
  galeria_header:     ['/galeria'],
  clientes_cta:       ['/clientes'],
  contacto_header:    ['/contacto'],
  navbar:             ['/'],
  footer_extra:       ['/'],
  home_gallery:       ['/'],
}

async function requireUser() {
  const db = await getServerDb()
  const user = await getSessionUser()
  if (!user) throw new Error('No autenticado.')
  return db
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
    const db = await requireUser()

    if (!key) return { error: 'Clave de configuración requerida.' }

    const value: Record<string, unknown> = {}
    for (const [field, raw] of formData.entries()) {
      if (typeof raw !== 'string') continue
      value[field] = parseFieldValue(raw)
    }

    const { error } = await db
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) return { error: friendlyError(error, 'No se pudo guardar. Intentá de nuevo.') }

    const paths = SETTING_PATHS[key] ?? ['/']
    for (const p of paths) revalidatePath(p)

    return { success: true }
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo guardar. Intentá de nuevo.') }
  }
}

// ─────────────────────────────────────────────────────────────
// Upload de media al bucket de Storage
// ─────────────────────────────────────────────────────────────

/**
 * Sube un archivo al bucket `media`.
 * - Imágenes rasterizadas: resize ≤2000px + WebP q=82 via sharp.
 * - video/mp4: comprimido con el servicio global (lib/transcode-client.ts) si está configurado;
 *   si no, se sube tal cual (mismo criterio de fallback del script
 *   de build — nunca rompe el upload por faltar el binario).
 * - SVG / GIF / PDF: se suben tal cual (sin optimización).
 *
 * formData: { file: File, folder: string, oldUrl?: string }
 */
export async function uploadMediaAction(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  try {
    await requireUser()
    const file = formData.get('file')
    if (!(file instanceof File)) return { error: 'Archivo inválido.' }

    const mime = file.type || ''
    const isVideo = mime === 'video/mp4'
    const isDoc = mime === 'application/pdf'
    if (mime === 'image/svg+xml') return { error: 'No se admiten archivos SVG. Subí PNG, JPG o WebP.' }

    if (isVideo && file.size > MAX_VIDEO_BYTES) return { error: 'El video no puede superar 20 MB.' }
    if (isDoc && file.size > MAX_DOC_BYTES) return { error: 'El documento no puede superar 8 MB.' }
    if (!isVideo && !isDoc && file.size > MAX_IMAGE_BYTES) return { error: 'La imagen no puede superar 12 MB.' }

    const folder = String(formData.get('folder') ?? 'uploads')

    // Borrar archivo anterior si viene URL del mismo bucket
    const oldUrl = String(formData.get('oldUrl') ?? '')
    if (oldUrl) {
      const oldPath = extractStoragePath(oldUrl)
      if (oldPath) {
        await removeMedia([oldPath])
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
      // Servicio global de compresión; sin él (o si falla) se guarda el original.
      buf         = (await transcodeWithService(original, 'hero')) ?? original
      ext         = 'mp4'
      contentType = 'video/mp4'
    } else {
      buf         = original
      ext         = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
      contentType = mime || 'application/octet-stream'
    }

    const path = `${folder}/${id}.${ext}`

    const url = await putMedia(path, buf, contentType)
    return { url }
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo subir el archivo. Intentá de nuevo.') }
  }
}

/** Borra un archivo del bucket `media` a partir de su URL pública (botón "Quitar" en el dashboard). */
export async function deleteMediaAction(url: string): Promise<{ error?: string }> {
  try {
    await requireUser()
    const path = extractStoragePath(url)
    if (!path) return {}
    await removeMedia([path])
    return {}
  } catch (e) {
    return { error: friendlyError(e, 'No se pudo eliminar el archivo.') }
  }
}
