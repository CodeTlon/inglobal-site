import { requireApiUser, apiData, apiError } from '@/lib/api-auth'
import { friendlyError } from '@/lib/friendly-error'
import { eventoAgendaSchema } from '@/lib/validations/agenda'
import { getEventoAgendaById } from '@/lib/agenda'
import { validarGrua, validarOperarios, buscarConflicto, syncEventoOperarios, validarEdicionEvento, validarBorradoEvento } from '@/lib/agenda-business'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const auth = await requireApiUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params

    const evento = await getEventoAgendaById(id, auth.db)
    if (!evento) return apiError('No se encontró el evento.', 404)
    return apiData(evento)
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireApiUser(request)
    if (auth instanceof Response) return auth
    const { db } = auth
    const { id } = await params

    const body = await request.json().catch(() => null)
    if (!body) return apiError('Body inválido.', 400)

    const parsed = eventoAgendaSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

    const { hora_fin, ...rest } = parsed.data

    const errorEdicion = await validarEdicionEvento(db, id, { ...rest, hora_fin: hora_fin || null })
    if (errorEdicion) return apiError(errorEdicion, 409)

    const operarioIds = Array.isArray(body.operario_ids) ? body.operario_ids.filter((v: unknown) => typeof v === 'string') : []

    // Cancelar libera recursos: no se exige grúa/operarios activos ni se re-chequea conflicto.
    if (parsed.data.estado !== 'cancelado') {
      const errorGrua = await validarGrua(db, rest.grua_id)
      if (errorGrua) return apiError(errorGrua, 409)

      const errorOperarios = await validarOperarios(db, operarioIds)
      if (errorOperarios) return apiError(errorOperarios, 409)

      const conflicto = await buscarConflicto(db, parsed.data, rest.grua_id, operarioIds, id)
      if (conflicto) return apiError(conflicto, 409)
    }

    const { error } = await db
      .from('eventos_agenda')
      .update({ ...rest, hora_fin: hora_fin || null, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return apiError(friendlyError(error), 500)

    const syncError = await syncEventoOperarios(db, id, operarioIds)
    if (syncError) return apiError(syncError, 500)

    return apiData({ id })
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const auth = await requireApiUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params

    const errorBorrado = await validarBorradoEvento(auth.db, id)
    if (errorBorrado) return apiError(errorBorrado, 409)

    const { error } = await auth.db.from('eventos_agenda').delete().eq('id', id)
    if (error) return apiError(friendlyError(error), 500)

    return apiData({ id })
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
