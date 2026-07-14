'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { servicioSchema } from '@/lib/validations/servicio'
import { nextFreeOrder } from '@/lib/ordering'

export type ServicioState = { success?: boolean; error?: string } | undefined

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

function parseSpecs(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function revalidateServicios() {
  revalidatePath('/servicios')
  revalidatePath('/')            // sección servicios preview del home
  revalidatePath('/dashboard/servicios')
}

/**
 * Actualiza un servicio existente (los 4 servicios son fijos — no hay create/delete).
 * formData: { id, slug, title, desc, specs (una por línea), img, icon, display_order, published }
 */
export async function updateServicio(
  prevState: unknown,
  formData: FormData,
): Promise<ServicioState> {
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de servicio requerido.' }

    const parsed = servicioSchema.safeParse({
      slug:          formData.get('slug'),
      title:         formData.get('title'),
      desc:          formData.get('desc'),
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
