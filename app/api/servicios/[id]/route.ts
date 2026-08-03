import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { servicioSchema } from '@/lib/validations/servicio'
import { nextFreeOrder } from '@/lib/ordering'
import { removeMediaUrls } from '@/lib/storage'
import { titleExists, parseSpecs } from '@/lib/servicios-business'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { id } = await params

  const { data, error } = await auth.supabase.from('servicios').select('*').eq('id', id).single()
  if (error || !data) return apiError('No se encontró el servicio.', 404)
  return apiData(data)
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { supabase } = auth
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return apiError('Body inválido.', 400)

  const parsed = servicioSchema.omit({ slug: true }).safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

  const { specs, ...rest } = parsed.data

  if (await titleExists(supabase, rest.title, id)) return apiError('Ya existe un servicio con ese título.', 409)

  rest.display_order = await nextFreeOrder(supabase, 'servicios', 'display_order', rest.display_order, { excludeId: id })

  const { error } = await supabase
    .from('servicios')
    .update({ ...rest, specs: parseSpecs(specs), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return apiError(friendlyError(error), 500)
  return apiData({ id })
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { supabase } = auth
  const { id } = await params

  const { data: existing } = await supabase.from('servicios').select('img').eq('id', id).single()
  const { error } = await supabase.from('servicios').delete().eq('id', id)
  if (error) return apiError(friendlyError(error), 500)

  if (existing) await removeMediaUrls(supabase, [existing.img])
  return apiData({ id })
}
