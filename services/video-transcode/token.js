import { createHmac, timingSafeEqual } from 'node:crypto'

// Token stateless: exp + firma HMAC, sin DB ni store — el mismo secreto vive acá
// y en TRANSCODE_SHARED_SECRET del sitio Next.js (lib/transcode-token.ts), que es
// quien lo emite. Ventana corta (5min default) en vez de un solo uso: riesgo bajo
// (nadie interesado en gastar CPU de un VPS de una gruera), simplicidad alta.
export function createToken(secret, ttlMs = 5 * 60 * 1000) {
  const exp = Date.now() + ttlMs
  const sig = createHmac('sha256', secret).update(String(exp)).digest('hex')
  return `${exp}.${sig}`
}

export function validToken(token, secret) {
  if (!token || !secret) return false
  const [expStr, sig] = token.split('.')
  if (!expStr || !sig) return false
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || Date.now() > exp) return false
  const expected = createHmac('sha256', secret).update(expStr).digest('hex')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
