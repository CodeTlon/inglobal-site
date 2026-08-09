import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { operarioSchema } from '@/lib/validations/agenda'
import { catalogToggle, catalogDelete, operarioDuplicado } from '@/lib/agenda-business'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { supabase } = auth
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return apiError('Body inválido.', 400)

  if (Object.keys(body).length === 1 && typeof body.activo === 'boolean') {
    const result = await catalogToggle(supabase, 'operarios', id, body.activo)
    if (result.error) return apiError(result.error, 409)
    return apiData({ id })
  }

  const parsed = operarioSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

  const duplicado = await operarioDuplicado(supabase, parsed.data.nombre, id)
  if (duplicado) return apiError(duplicado, 409)

  const { error } = await supabase.from('operarios').update(parsed.data).eq('id', id)
  if (error) return apiError(friendlyError(error), 500)

  return apiData({ id })
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { id } = await params

  const result = await catalogDelete(auth.supabase, 'operarios', id)
  if (result.error) return apiError(result.error, 409)

  return apiData({ id })
}
