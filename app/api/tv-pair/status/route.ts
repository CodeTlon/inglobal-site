import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { apiData, apiError } from '@/lib/supabase-api'

// Sin auth a propósito — la TV todavía no tiene sesión cuando pollea esto.
// Devuelve solo el status, nunca datos de usuario (approved_by no se expone acá).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return apiError('token requerido.', 400)

  const admin = createSupabaseAdminClient()
  const { data } = await admin.from('tv_pairing_codes').select('status, expires_at').eq('token', token).single()
  if (!data) return apiData({ status: 'expired' })

  if (data.status === 'pending' && new Date(data.expires_at) < new Date()) {
    await admin.from('tv_pairing_codes').update({ status: 'expired' }).eq('token', token)
    return apiData({ status: 'expired' })
  }

  return apiData({ status: data.status })
}
