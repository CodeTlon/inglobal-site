import { requireApiUser, apiData, apiError } from '@/lib/api-auth'
import { friendlyError } from '@/lib/friendly-error'
import { operarioSchema } from '@/lib/validations/agenda'
import { catalogToggle, catalogDelete, operarioDuplicado, reincorporarOperario, eliminarOperarioDefinitivo } from '@/lib/agenda-business'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireApiUser(request)
    if (auth instanceof Response) return auth
    const { db } = auth
    const { id } = await params

    const body = await request.json().catch(() => null)
    if (!body) return apiError('Body inválido.', 400)

    if (Object.keys(body).length === 1 && typeof body.activo === 'boolean') {
      const result = await catalogToggle(db, 'operarios', id, body.activo)
      if (result.error) return apiError(result.error, 409)
      return apiData({ id })
    }

    if (Object.keys(body).length === 1 && body.reincorporar === true) {
      const result = await reincorporarOperario(db, id)
      if (result.error) return apiError(result.error, 409)
      return apiData({ id })
    }

    const parsed = operarioSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

    const duplicado = await operarioDuplicado(db, parsed.data.nombre, id)
    if (duplicado) return apiError(duplicado, 409)

    const { error } = await db.from('operarios').update(parsed.data).eq('id', id)
    if (error) return apiError(friendlyError(error), 500)

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

    // Sin parámetro: baja lógica (pasa a ex operario). `?definitivo=true`: borrado
    // real, solo para un ex operario sin eventos (ver eliminarOperarioDefinitivo).
    const definitivo = new URL(request.url).searchParams.get('definitivo') === 'true'
    const result = definitivo
      ? await eliminarOperarioDefinitivo(auth.db, id)
      : await catalogDelete(auth.db, 'operarios', id)
    if (result.error) return apiError(result.error, 409)

    return apiData({ id })
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
