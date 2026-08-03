import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

// Requiere Bearer: solo un usuario mobile ya logueado puede aprobar un pairing de TV.
export async function POST(request: Request) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)

  const body = await request.json().catch(() => null)
  const token = body?.token
  if (!token || typeof token !== 'string') return apiError('token requerido.', 400)

  const admin = createSupabaseAdminClient()
  const { data: pairing } = await admin.from('tv_pairing_codes').select('status, expires_at').eq('token', token).single()
  if (!pairing) return apiError('Código inválido.', 404)
  if (pairing.status !== 'pending') return apiError('Este código ya no es válido.', 409)
  if (new Date(pairing.expires_at) < new Date()) return apiError('El código expiró.', 409)

  const { error } = await admin
    .from('tv_pairing_codes')
    .update({ status: 'approved', approved_by: auth.user.id, approved_at: new Date().toISOString() })
    .eq('token', token)
  if (error) return apiError('No se pudo aprobar el código.', 500)

  return apiData({ ok: true })
}
