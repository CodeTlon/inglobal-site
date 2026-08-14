import crypto from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { apiData, apiError } from '@/lib/supabase-api'

// ponytail: 2 min era insuficiente para el flujo real (abrir la app, dar permiso de
// cámara la primera vez, navegar y escanear) — el QR expiraba antes de aprobarlo.
const TTL_MS = 5 * 60 * 1000

export async function POST() {
  const admin = createSupabaseAdminClient()
  const token = crypto.randomBytes(24).toString('hex')
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString()

  const { error } = await admin.from('tv_pairing_codes').insert({ token, expires_at: expiresAt })
  if (error) return apiError('No se pudo generar el código.', 500)

  return apiData({ token, expiresAt })
}
