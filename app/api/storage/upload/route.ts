import { requireApiUser, apiData, apiError } from '@/lib/api-auth'
import { friendlyError } from '@/lib/friendly-error'
import { putMedia } from '@/lib/storage'
import { isTranscodePreset, transcodeWithService } from '@/lib/transcode-client'

export const dynamic = 'force-dynamic'

// Imágenes, video y PDF. Nunca ejecutables, HTML ni SVG (un SVG puede llevar scripts).
const MIME_PERMITIDOS = /^(image\/(jpeg|png|webp|gif|avif|heic|heif)|video\/(mp4|webm|quicktime)|application\/pdf)$/
const MAX_BYTES = 100 * 1024 * 1024
const CARPETA = /^[a-z0-9][a-z0-9/_-]{0,60}$/i

/**
 * Subida de un archivo al bucket `media` (app mobile y subidas grandes del panel).
 * multipart/form-data: `file` y `folder`. Devuelve la URL pública.
 * Reemplaza la subida directa a Supabase Storage que hacían la app y el navegador.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request)
    if (auth instanceof Response) return auth

    const form = await request.formData().catch(() => null)
    const file = form?.get('file')
    const folder = String(form?.get('folder') ?? 'uploads')
    if (!(file instanceof File)) return apiError('Falta el archivo.', 400)
    if (!CARPETA.test(folder) || folder.includes('..')) return apiError('Carpeta inválida.', 400)
    if (!MIME_PERMITIDOS.test(file.type)) return apiError('Tipo de archivo no permitido.', 415)
    if (file.size > MAX_BYTES) return apiError('El archivo es demasiado grande.', 413)

    let body: Buffer = Buffer.from(await file.arrayBuffer())
    let contentType = file.type
    let ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin'

    // `transcode=hero|web|mobile` pide comprimir el video con el servicio global (soft-fail).
    const preset = form?.get('transcode')
    if (file.type.startsWith('video/') && isTranscodePreset(preset)) {
      const comprimido = await transcodeWithService(body, preset)
      if (comprimido) {
        body = comprimido
        contentType = 'video/mp4'
        ext = 'mp4'
      }
    }

    const path = `${folder}/${crypto.randomUUID()}.${ext}`
    const url = await putMedia(path, body, contentType)
    return apiData({ url, path }, 201)
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
