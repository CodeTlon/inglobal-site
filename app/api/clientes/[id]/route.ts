import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { clienteSchema } from '@/lib/validations/cliente'
import { nextFreeOrder } from '@/lib/ordering'
import { removeMediaUrls } from '@/lib/storage'
import { uniqueSlug } from '@/lib/clientes-business'
import slugify from 'slugify'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { id } = await params

  const { data, error } = await auth.supabase.from('clientes').select('*').eq('id', id).single()
  if (error || !data) return apiError('No se encontró el cliente.', 404)
  return apiData(data)
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { supabase } = auth
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return apiError('Body inválido.', 400)

  const parsed = clienteSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

  const { data: existing } = await supabase.from('clientes').select('slug, name').eq('id', id).single()
  let slug = existing?.slug
  if (existing && existing.name !== parsed.data.name) {
    slug = await uniqueSlug(supabase, slugify(parsed.data.name, { lower: true, strict: true }), id)
  }
  const work_rank = await nextFreeOrder(supabase, 'clientes', 'work_rank', parsed.data.work_rank, { excludeId: id })

  const { error } = await supabase
    .from('clientes')
    .update({ ...parsed.data, slug, work_rank, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return apiError(friendlyError(error), 500)
  return apiData({ id })
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { supabase } = auth
  const { id } = await params

  const { data: existing } = await supabase.from('clientes').select('logo').eq('id', id).single()
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) return apiError(friendlyError(error), 500)

  if (existing) await removeMediaUrls(supabase, [existing.logo])
  return apiData({ id })
}
