import { requireApiUser, apiData, apiError } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { codigoDeVinculacion } from '@/lib/tv-pair-codigo'

// Lo llama la app después de escanear el QR y antes de aprobar: devuelve el código de verificación que la TV
// muestra en pantalla. Requiere sesión, así el código no sale de acá para alguien que no puede aprobar.
export async function GET(request: Request) {
  const auth = await requireApiUser(request)
  if (auth instanceof Response) return auth

  const token = new URL(request.url).searchParams.get('token')
  if (!token) return apiError('token requerido.', 400)

  const { data: pairing } = await db.from('tv_pairing_codes').select('status, expires_at').eq('token', token).single()
  if (!pairing) return apiError('Código inválido.', 404)
  if (pairing.status !== 'pending') return apiError('Este código ya no es válido.', 409)
  if (new Date(pairing.expires_at) < new Date()) return apiError('El código expiró.', 409)

  return apiData({ codigo: codigoDeVinculacion(token), expiresAt: pairing.expires_at })
}
