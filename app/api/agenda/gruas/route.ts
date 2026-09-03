import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { gruaSchema } from '@/lib/validations/agenda'
import { getGruas } from '@/lib/agenda'
import { gruaDuplicada } from '@/lib/agenda-business'

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser(request)
    if (!auth) return apiError('No autenticado.', 401)

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const gruas = await getGruas({ includeInactive }, auth.supabase)
    return apiData(gruas)
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request)
    if (!auth) return apiError('No autenticado.', 401)
    const { supabase } = auth

    const body = await request.json().catch(() => null)
    if (!body) return apiError('Body inválido.', 400)

    const parsed = gruaSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

    const duplicado = await gruaDuplicada(supabase, parsed.data.nombre, parsed.data.patente)
    if (duplicado) return apiError(duplicado, 409)

    const { data, error } = await supabase.from('gruas').insert(parsed.data).select('id').single()
    if (error) return apiError(friendlyError(error), 500)

    return apiData({ id: data.id }, 201)
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
