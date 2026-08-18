import { createHmac } from 'node:crypto'

// Mismo esquema que services/video-transcode/token.js (duplicado a propósito:
// son dos deploys distintos, no vale la pena un paquete compartido por 10 líneas).
const TTL_MS = 5 * 60 * 1000

export function createTranscodeToken(): string {
  const secret = process.env.TRANSCODE_SHARED_SECRET
  if (!secret) throw new Error('TRANSCODE_SHARED_SECRET no configurado')
  const exp = Date.now() + TTL_MS
  const sig = createHmac('sha256', secret).update(String(exp)).digest('hex')
  return `${exp}.${sig}`
}
