'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { friendlyError } from '@/lib/friendly-error'
import { servicioSchema } from '@/lib/validations/servicio'
import { nextFreeOrder } from '@/lib/ordering'
import { removeMediaUrls } from '@/lib/storage'
import { uniqueSlug, titleExists, parseSpecs } from '@/lib/servicios-business'

export type ServicioState = { success?: boolean; error?: string } | undefined

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
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

    if (error) return { error: friendlyError(error) }

    revalidateServicios()
  } catch (e) {
    return { error: friendlyError(e) }
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

    if (error) return { error: friendlyError(error) }

    revalidateServicios()
  } catch (e) {
    return { error: friendlyError(e) }
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

    if (error) return { error: friendlyError(error) }

    if (existing) await removeMediaUrls(supabase, [existing.img])

    revalidateServicios()
  } catch (e) {
    return { error: friendlyError(e) }
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
    if (failed?.error) return { error: friendlyError(failed.error) }

    revalidateServicios()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
