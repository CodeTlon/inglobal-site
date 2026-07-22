// Resize de imágenes en el navegador (Canvas API nativa, sin dependencia nueva)
// antes de subir. Necesario porque Vercel cappea el body de cualquier función
// serverless a 4.5MB sin importar next.config.mjs — una foto de celular de
// 15MB nunca llega a correr uploadMediaAction, Vercel la rechaza antes con un
// 413 que el navegador reporta como "unexpected response". Resizeando acá el
// archivo que viaja al server casi siempre queda bien por debajo de eso.
const MAX_DIMENSION = 2000
const QUALITY = 0.82

/** Formatos que Canvas no puede decodificar de forma confiable (o no tiene sentido resizear). */
const SKIP_TYPES = new Set(['image/svg+xml', 'image/gif'])

export async function resizeImageFile(file: File): Promise<File> {
  if (SKIP_TYPES.has(file.type) || !file.type.startsWith('image/')) return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    // Formato que el navegador no puede decodificar (ej. HEIC) — se manda tal
    // cual, uploadMediaAction lo va a rechazar con un mensaje claro si es
    // demasiado grande en vez de intentar un resize que va a fallar igual.
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
