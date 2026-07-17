// Límites de tamaño de archivo compartidos entre el cliente (validación instantánea
// antes de subir) y el server action (settings.ts, fuente de verdad). Si un archivo
// supera bodySizeLimit (next.config.mjs) Next rechaza el request a nivel framework
// antes de que el cliente/servidor puedan mostrar un error prolijo — por eso el
// chequeo del lado del cliente tiene que pasar ANTES de intentar la subida.
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024 // 12 MB
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024 // 20 MB (el server re-comprime, ver lib/video-transcode.ts)
export const MAX_DOC_BYTES = 8 * 1024 * 1024 // 8 MB
