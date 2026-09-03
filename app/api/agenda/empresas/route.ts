import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { empresaAgendaSchema } from '@/lib/validations/agenda'
import { getEmpresasAgenda } from '@/lib/agenda'
import { empresaAgendaDuplicada } from '@/lib/agenda-business'

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser(request)
    if (!auth) return apiError('No autenticado.', 401)

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const empresas = await getEmpresasAgenda({ includeInactive }, auth.supabase)
    return apiData(empresas)
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

    const parsed = empresaAgendaSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

    const duplicada = await empresaAgendaDuplicada(supabase, parsed.data.nombre)
    if (duplicada) return apiError(duplicada, 409)

    const { data, error } = await supabase.from('empresas_agenda').insert(parsed.data).select('id').single()
    if (error) return apiError(friendlyError(error), 500)

    return apiData({ id: data.id }, 201)
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
