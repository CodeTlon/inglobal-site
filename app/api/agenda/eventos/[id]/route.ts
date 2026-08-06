import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { eventoAgendaSchema } from '@/lib/validations/agenda'
import { getEventoAgendaById } from '@/lib/agenda'
import { validarGrua, validarOperarios, buscarConflicto, syncEventoOperarios, validarEdicionEvento } from '@/lib/agenda-business'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { id } = await params

  const evento = await getEventoAgendaById(id, auth.supabase)
  if (!evento) return apiError('No se encontró el evento.', 404)
  return apiData(evento)
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { supabase } = auth
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return apiError('Body inválido.', 400)

  const parsed = eventoAgendaSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

  const { hora_fin, ...rest } = parsed.data

  const errorEdicion = await validarEdicionEvento(supabase, id, { ...rest, hora_fin: hora_fin || null })
  if (errorEdicion) return apiError(errorEdicion, 409)

  const operarioIds = Array.isArray(body.operario_ids) ? body.operario_ids.filter((v: unknown) => typeof v === 'string') : []

  const errorGrua = await validarGrua(supabase, rest.grua_id)
  if (errorGrua) return apiError(errorGrua, 409)

  const errorOperarios = await validarOperarios(supabase, operarioIds)
  if (errorOperarios) return apiError(errorOperarios, 409)

  const conflicto = await buscarConflicto(supabase, parsed.data, rest.grua_id, operarioIds, id)
  if (conflicto) return apiError(conflicto, 409)

  const { error } = await supabase
    .from('eventos_agenda')
    .update({ ...rest, hora_fin: hora_fin || null, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return apiError(friendlyError(error), 500)

  const syncError = await syncEventoOperarios(supabase, id, operarioIds)
  if (syncError) return apiError(syncError, 500)

  return apiData({ id })
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { id } = await params

  const { error } = await auth.supabase.from('eventos_agenda').delete().eq('id', id)
  if (error) return apiError(friendlyError(error), 500)

  return apiData({ id })
}
