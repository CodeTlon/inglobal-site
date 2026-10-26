import { timingSafeEqual } from 'node:crypto'

/** `Authorization: Bearer <CRON_SECRET>` comparado en tiempo constante. Sin `CRON_SECRET` configurado, rechaza todo. */
export function cronAutorizado(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const esperado = Buffer.from(`Bearer ${secret}`)
  const recibido = Buffer.from(request.headers.get('authorization') ?? '')
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado)
}
