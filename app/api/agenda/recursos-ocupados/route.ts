import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { getRecursosOcupados } from '@/lib/agenda-business'
import { friendlyError } from '@/lib/friendly-error'

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser(request)
    if (!auth) return apiError('No autenticado.', 401)

    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha')
    const horaInicio = searchParams.get('horaInicio')
    if (!fecha || !horaInicio) return apiError('fecha y horaInicio son requeridos.', 400)

    const fechaHasta = searchParams.get('fechaHasta')
    const horaFin = searchParams.get('horaFin')
    const excludeEventoId = searchParams.get('excludeEventoId') ?? undefined

    const result = await getRecursosOcupados(auth.supabase, fecha, fechaHasta, horaInicio, horaFin, excludeEventoId)
    return apiData(result)
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
