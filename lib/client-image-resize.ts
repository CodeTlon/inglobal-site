// Resize de imágenes en el navegador (Canvas API nativa, sin dependencia nueva)
// antes de subir. Necesario porque Vercel cappea el body de cualquier función
// serverless a 4.5MB sin importar next.config.mjs — una foto de celular de
// 15MB nunca llega a correr uploadMediaAction, Vercel la rechaza antes con un
// 413 que el navegador reporta como "unexpected response". Resizeando acá el
// archivo que viaja al server casi siempre queda bien por debajo de eso.
const MAX_DIMENSION = 2000
const QUALITY = 0.82
// Vercel cappea el body en ~4.5MB — dejamos margen porque FormData/multipart
// suma overhead sobre el tamaño crudo del archivo.
const MAX_UNRESIZED_BYTES = 4 * 1024 * 1024

/** Formatos que Canvas no puede decodificar de forma confiable (o no tiene sentido resizear). */
const SKIP_TYPES = new Set(['image/svg+xml', 'image/gif'])

/**
 * Se lanza cuando el archivo no se pudo resizear en el navegador (típico:
 * fotos HEIC/HEIF de iPhone, que Chrome/Firefox no saben decodificar en
 * Canvas — Safari a veces sí) Y es demasiado grande para mandar tal cual.
 * Antes esto se mandaba igual y Vercel lo rechazaba con un 413 antes de
 * llegar a uploadMediaAction — el navegador lo reportaba como "unexpected
 * response", sin ningún mensaje ni log útil. Mejor cortar acá con un error
 * claro y accionable.
 */
export class ImagenNoSoportadaError extends Error {}

export async function resizeImageFile(file: File): Promise<File> {
  if (SKIP_TYPES.has(file.type) || !file.type.startsWith('image/')) return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    if (file.size > MAX_UNRESIZED_BYTES) {
      throw new ImagenNoSoportadaError(
        'Esta foto es de un formato que no podemos procesar acá (suele pasar con HEIC de iPhone) y es demasiado pesada para subir tal cual. ' +
        'Probá convertirla a JPG, o en el iPhone: Ajustes → Cámara → Formatos → "Más compatible".',
      )
    }
    // Formato no decodificable pero liviano — no hace falta resizear, se
    // manda tal cual (nunca va a chocar con el límite de Vercel).
    return file
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY)
  )
  if (!blob) return file

  return new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' })
}
