import { requireApiUser, apiData, apiError } from '@/lib/api-auth'
import { friendlyError } from '@/lib/friendly-error'
import { crearEventoSchema } from '@/lib/validations/agenda'
import { getEventosAgenda } from '@/lib/agenda'
import { validarGruas, resolverGruaIds, syncEventoGruas, validarOperarios, buscarConflicto, syncEventoOperarios } from '@/lib/agenda-business'

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser(request)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde') ?? undefined
    const hasta = searchParams.get('hasta') ?? undefined
    // Filtros por recurso — historial de una grúa/empresa/operario puntual
    // (detalle de catálogo). Sin desde/hasta trae todo el historial.
    const gruaId = searchParams.get('grua_id') ?? undefined
    const empresaId = searchParams.get('empresa_id') ?? undefined
    const operarioId = searchParams.get('operario_id') ?? undefined

    const eventos = await getEventosAgenda({ desde, hasta, gruaId, empresaId, operarioId }, auth.db)
    return apiData(eventos)
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request)
    if (auth instanceof Response) return auth
    const { db } = auth

    const body = await request.json().catch(() => null)
    if (!body) return apiError('Body inválido.', 400)

    const parsed = crearEventoSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

    const { hora_fin, grua_ids, ...rest } = parsed.data
    const gruaIds = resolverGruaIds(grua_ids, rest.grua_id)
    const operarioIds = Array.isArray(body.operario_ids) ? body.operario_ids.filter((id: unknown) => typeof id === 'string') : []

    const errorGrua = await validarGruas(db, gruaIds)
    if (errorGrua) return apiError(errorGrua, 409)

    const errorOperarios = await validarOperarios(db, operarioIds)
    if (errorOperarios) return apiError(errorOperarios, 409)

    const conflicto = await buscarConflicto(db, parsed.data, gruaIds, operarioIds)
    if (conflicto) return apiError(conflicto, 409)

    const { data, error } = await db
      .from('eventos_agenda')
      .insert({ ...rest, grua_id: gruaIds[0], hora_fin: hora_fin || null })
      .select('id')
      .single()

    if (error || !data) return apiError(error ? friendlyError(error) : 'No se pudo crear el evento.', 500)

    const syncGruasError = await syncEventoGruas(db, data.id, gruaIds)
    if (syncGruasError) return apiError(syncGruasError, 500)

    const syncError = await syncEventoOperarios(db, data.id, operarioIds)
    if (syncError) return apiError(syncError, 500)

    return apiData({ id: data.id }, 201)
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
