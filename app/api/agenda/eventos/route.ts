import { filtrosEventosSchema } from '@/lib/validations/agenda'
import { requireApiUser, apiData, apiError } from '@/lib/api-auth'
import { friendlyError } from '@/lib/friendly-error'
import { crearEventoSchema } from '@/lib/validations/agenda'
import { getEventosAgenda } from '@/lib/agenda'
import { validarGruas, resolverGruaIds, validarOperarios, buscarConflicto, guardarEventoConRelaciones } from '@/lib/agenda-business'

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser(request)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const filtros = filtrosEventosSchema.safeParse({
      desde: searchParams.get('desde') ?? undefined,
      hasta: searchParams.get('hasta') ?? undefined,
      // Filtros por recurso — historial de una grúa/empresa/operario puntual
      // (detalle de catálogo). Sin desde/hasta trae todo el historial.
      gruaId: searchParams.get('grua_id') ?? undefined,
      empresaId: searchParams.get('empresa_id') ?? undefined,
      operarioId: searchParams.get('operario_id') ?? undefined,
    })
    if (!filtros.success) return apiError('Filtros inválidos: fechas YYYY-MM-DD e ids válidos.', 400)
    const { desde, hasta, gruaId, empresaId, operarioId } = filtros.data

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

    const { id, error } = await guardarEventoConRelaciones(db, null, { ...rest, grua_id: gruaIds[0], hora_fin: hora_fin || null }, gruaIds, operarioIds)
    if (error) return apiError(error, 409)

    return apiData({ id }, 201)
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
