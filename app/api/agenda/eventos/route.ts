import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { eventoAgendaSchema } from '@/lib/validations/agenda'
import { getEventosAgenda } from '@/lib/agenda'
import { validarOperarios, buscarConflicto, syncEventoOperarios } from '@/lib/agenda-business'

export async function GET(request: Request) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)

  const { searchParams } = new URL(request.url)
  const desde = searchParams.get('desde') ?? undefined
  const hasta = searchParams.get('hasta') ?? undefined

  const eventos = await getEventosAgenda({ desde, hasta }, auth.supabase)
  return apiData(eventos)
}

export async function POST(request: Request) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { supabase } = auth

  const body = await request.json().catch(() => null)
  if (!body) return apiError('Body inválido.', 400)

  const parsed = eventoAgendaSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

  const { hora_fin, ...rest } = parsed.data
  const operarioIds = Array.isArray(body.operario_ids) ? body.operario_ids.filter((id: unknown) => typeof id === 'string') : []

  const errorOperarios = await validarOperarios(supabase, operarioIds)
  if (errorOperarios) return apiError(errorOperarios, 409)

  const conflicto = await buscarConflicto(supabase, parsed.data, rest.grua_id, operarioIds)
  if (conflicto) return apiError(conflicto, 409)

  const { data, error } = await supabase
    .from('eventos_agenda')
    .insert({ ...rest, hora_fin: hora_fin || null })
    .select('id')
    .single()

  if (error || !data) return apiError(error ? friendlyError(error) : 'No se pudo crear el evento.', 500)

  const syncError = await syncEventoOperarios(supabase, data.id, operarioIds)
  if (syncError) return apiError(syncError, 500)

  return apiData({ id: data.id }, 201)
}
