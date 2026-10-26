import { clientIp } from '@/lib/client-ip'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { apiData, apiError } from '@/lib/api-auth'
import { createRateLimiter } from '@/lib/rate-limit'

// ponytail: 2 min era insuficiente para el flujo real (abrir la app, dar permiso de
// cámara la primera vez, navegar y escanear) — el QR expiraba antes de aprobarlo.
const TTL_MS = 5 * 60 * 1000

// Endpoint público (la TV todavía no tiene sesión): sin tope, cualquiera podía llenar la
// tabla de códigos. Una TV real pide uno cada pocos minutos.
const isRateLimited = createRateLimiter('tv-pair-start', 60_000, 6)

export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  if (await isRateLimited(ip)) return apiError('Demasiados intentos. Esperá un minuto.', 429)

  const admin = db
  // Limpieza oportunista: códigos de más de un día ya no sirven para nada.
  await admin.from('tv_pairing_codes').delete().lt('expires_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  const token = crypto.randomBytes(24).toString('hex')
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString()

  const { error } = await admin.from('tv_pairing_codes').insert({ token, expires_at: expiresAt })
  if (error) return apiError('No se pudo generar el código.', 500)

  return apiData({ token, expiresAt })
}
