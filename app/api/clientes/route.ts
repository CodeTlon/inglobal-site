import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { clienteSchema } from '@/lib/validations/cliente'
import { nextFreeOrder } from '@/lib/ordering'
import { uniqueSlug } from '@/lib/clientes-business'
import slugify from 'slugify'

// Lectura CRUD (autenticada, todos los registros — publicados o no) para la app mobile.
// Distinto de lib/content.ts#getClientes, que es de lectura pública (cliente anon,
// solo published, con fallback estático) — no reusar esa acá.
export async function GET(request: Request) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)

  const { data, error } = await auth.supabase.from('clientes').select('*').order('work_rank', { ascending: false })
  if (error) return apiError(friendlyError(error), 500)
  return apiData(data)
}

export async function POST(request: Request) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { supabase } = auth

  const body = await request.json().catch(() => null)
  if (!body) return apiError('Body inválido.', 400)

  const parsed = clienteSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

  const slug = await uniqueSlug(supabase, slugify(parsed.data.name, { lower: true, strict: true }))
  const work_rank = await nextFreeOrder(supabase, 'clientes', 'work_rank', parsed.data.work_rank)

  const { data, error } = await supabase
    .from('clientes')
    .insert({ ...parsed.data, slug, work_rank, updated_at: new Date().toISOString() })
    .select('id')
    .single()

  if (error) return apiError(friendlyError(error), 500)
  return apiData({ id: data.id }, 201)
}
