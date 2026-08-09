import { requireApiUser, apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { operarioSchema } from '@/lib/validations/agenda'
import { getOperarios } from '@/lib/agenda'
import { operarioDuplicado } from '@/lib/agenda-business'

export async function GET(request: Request) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)

  const { searchParams } = new URL(request.url)
  const includeInactive = searchParams.get('includeInactive') === 'true'

  const operarios = await getOperarios({ includeInactive }, auth.supabase)
  return apiData(operarios)
}

export async function POST(request: Request) {
  const auth = await requireApiUser(request)
  if (!auth) return apiError('No autenticado.', 401)
  const { supabase } = auth

  const body = await request.json().catch(() => null)
  if (!body) return apiError('Body inválido.', 400)

  const parsed = operarioSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Datos inválidos.', 400)

  const duplicado = await operarioDuplicado(supabase, parsed.data.nombre)
  if (duplicado) return apiError(duplicado, 409)

  const { data, error } = await supabase.from('operarios').insert(parsed.data).select('id').single()
  if (error) return apiError(friendlyError(error), 500)

  return apiData({ id: data.id }, 201)
}
