import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { servicioSchema } from '@/lib/validations/servicio'
import { nextFreeOrder } from '@/lib/ordering'
import { uniqueSlug, titleExists, parseSpecs } from '@/lib/servicios-business'
import slugify from 'slugify'

export async function GET(request: Request) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)

  const { data, error } = await auth.supabase.from('servicios').select('*').order('display_order', { ascending: true })
  if (error) return apiError(friendlyError(error), 500)
  return apiData(data)
}

export async function POST(request: Request) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { supabase } = auth

  const body = await request.json().catch(() => null)
  if (!body) return apiError('Body inválido.', 400)

  const parsed = servicioSchema.omit({ slug: true }).safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

  const { specs, title, ...rest } = parsed.data

  if (await titleExists(supabase, title)) return apiError('Ya existe un servicio con ese título.', 409)

  const slug = await uniqueSlug(supabase, slugify(title, { lower: true, strict: true }))
  rest.display_order = await nextFreeOrder(supabase, 'servicios', 'display_order', rest.display_order)

  const { data, error } = await supabase
    .from('servicios')
    .insert({ title, slug, ...rest, specs: parseSpecs(specs), updated_at: new Date().toISOString() })
    .select('id')
    .single()

  if (error) return apiError(friendlyError(error), 500)
  return apiData({ id: data.id }, 201)
}
