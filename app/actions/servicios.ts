'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { servicioSchema } from '@/lib/validations/servicio'
import { nextFreeOrder } from '@/lib/ordering'
import { removeMediaUrls } from '@/lib/storage'

export type ServicioState = { success?: boolean; error?: string } | undefined

type ServerSupabase = Awaited<ReturnType<typeof createSupabaseServerClient>>

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

async function uniqueSlug(supabase: ServerSupabase, base: string) {
  let slug = base
  let n = 2
  while (true) {
    const { data } = await supabase.from('servicios').select('id').eq('slug', slug).limit(1)
    if (!data || data.length === 0) return slug
    slug = `${base}-${n++}`
  }
}

async function titleExists(supabase: ServerSupabase, title: string, excludeId?: string) {
  let query = supabase.from('servicios').select('id').ilike('title', title)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query.limit(1)
  return !!data && data.length > 0
}

// StringList (Field.tsx) serializa el input oculto como JSON — no texto
// separado por saltos de línea.
function parseSpecs(raw: string | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string' && s.trim() !== '') : []
  } catch {
    return []
  }
}

function revalidateServicios() {
  revalidatePath('/servicios')
  revalidatePath('/')            // sección servicios preview del home
  revalidatePath('/dashboard/servicios')
}

/**
 * Crea un servicio nuevo. formData: { title, desc, specs, img, icon, display_order, published }
 * (sin slug — se genera desde el título, mismo patrón que montajes/clientes).
 */
export async function createServicio(
  prevState: unknown,
  formData: FormData,
): Promise<ServicioState> {
  try {
    const supabase = await requireUser()

    const parsed = servicioSchema.omit({ slug: true }).safeParse({
      title:         formData.get('title'),
      desc:          formData.get('desc'),
      excerpt:       formData.get('excerpt'),
      specs:         formData.get('specs'),
      img:           formData.get('img'),
      icon:          formData.get('icon'),
      display_order: formData.get('display_order'),
      published:     formData.get('published'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const { specs, title, ...rest } = parsed.data

    if (await titleExists(supabase, title)) {
      return { error: 'Ya existe un servicio con ese título.' }
    }

    const slug = await uniqueSlug(supabase, slugify(title, { lower: true, strict: true }))
    rest.display_order = await nextFreeOrder(supabase, 'servicios', 'display_order', rest.display_order)

    const { error } = await supabase.from('servicios').insert({
      title,
      slug,
      ...rest,
      specs: parseSpecs(specs),
      updated_at: new Date().toISOString(),
    })

    if (error) return { error: error.message }

    revalidateServicios()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
  redirect('/dashboard/servicios?saved=created')
}

/**
 * Actualiza un servicio existente.
 * formData: { id, title, desc, specs (una por línea), img, icon, display_order, published }
 */
export async function updateServicio(
  prevState: unknown,
  formData: FormData,
): Promise<ServicioState> {
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de servicio requerido.' }

    const parsed = servicioSchema.omit({ slug: true }).safeParse({
      title:         formData.get('title'),
      desc:          formData.get('desc'),
      excerpt:       formData.get('excerpt'),
      specs:         formData.get('specs'),
      img:           formData.get('img'),
      icon:          formData.get('icon'),
      display_order: formData.get('display_order'),
      published:     formData.get('published'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const { specs, ...rest } = parsed.data

    if (await titleExists(supabase, rest.title, id)) {
      return { error: 'Ya existe un servicio con ese título.' }
    }

    rest.display_order = await nextFreeOrder(supabase, 'servicios', 'display_order', rest.display_order, { excludeId: id })

    const { error } = await supabase
      .from('servicios')
      .update({ ...rest, specs: parseSpecs(specs), updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidateServicios()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
  redirect('/dashboard/servicios?saved=updated')
}

export async function deleteServicio(
  prevState: unknown,
  formData: FormData,
): Promise<ServicioState> {
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de servicio requerido.' }

    const { data: existing } = await supabase.from('servicios').select('img').eq('id', id).single()

    const { error } = await supabase.from('servicios').delete().eq('id', id)

    if (error) return { error: error.message }

    if (existing) await removeMediaUrls(supabase, [existing.img])

    revalidateServicios()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
  redirect('/dashboard/servicios?saved=deleted')
}

/**
 * Reordena los servicios actualizando display_order de múltiples filas.
 * formData: { orders: JSON string de [{ id: string, display_order: number }] }
 */
export async function reorderServicios(
  prevState: unknown,
  formData: FormData,
): Promise<ServicioState> {
  try {
    const supabase = await requireUser()

    const raw = String(formData.get('orders') ?? '').trim()
    let orders: { id: string; display_order: number }[]
    try {
      orders = JSON.parse(raw)
    } catch {
      return { error: 'Formato de orden inválido.' }
    }

    if (!Array.isArray(orders) || orders.length === 0) {
      return { error: 'Lista de orden vacía.' }
    }

    const updates = orders.map(({ id, display_order }) =>
      supabase
        .from('servicios')
        .update({ display_order, updated_at: new Date().toISOString() })
        .eq('id', id),
    )

    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed?.error) return { error: failed.error.message }

    revalidateServicios()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}
