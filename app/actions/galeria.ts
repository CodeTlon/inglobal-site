'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { galeriaSchema } from '@/lib/validations/galeria'
import { removeMediaUrls } from '@/lib/storage'
import { nextFreeOrder } from '@/lib/ordering'

export type GaleriaState = { success?: boolean; error?: string } | undefined
const LIST_PATH = '/dashboard/galeria'

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

function revalidateGaleria() {
  revalidatePath('/galeria')
  revalidatePath('/dashboard/galeria')
}

function parse(formData: FormData) {
  return galeriaSchema.safeParse({
    imagen:           formData.get('imagen'),
    alt:              formData.get('alt'),
    col_span_mobile:  formData.get('col_span_mobile'),
    row_span_mobile:  formData.get('row_span_mobile'),
    col_span_desktop: formData.get('col_span_desktop'),
    row_span_desktop: formData.get('row_span_desktop'),
    display_order:    formData.get('display_order'),
    published:        formData.get('published'),
  })
}

export async function createGaleriaItem(
  prevState: unknown,
  formData: FormData,
): Promise<GaleriaState> {
  try {
    const supabase = await requireUser()

    const parsed = parse(formData)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const display_order = await nextFreeOrder(supabase, 'galeria', 'display_order', parsed.data.display_order)

    const { error } = await supabase.from('galeria').insert({
      ...parsed.data,
      display_order,
      updated_at: new Date().toISOString(),
    })

    if (error) return { error: error.message }

    revalidateGaleria()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
  redirect(`${LIST_PATH}?saved=1`)
}

export async function updateGaleriaItem(
  prevState: unknown,
  formData: FormData,
): Promise<GaleriaState> {
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de imagen requerido.' }

    const parsed = parse(formData)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const display_order = await nextFreeOrder(supabase, 'galeria', 'display_order', parsed.data.display_order, { excludeId: id })

    const { error } = await supabase
      .from('galeria')
      .update({ ...parsed.data, display_order, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidateGaleria()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
  redirect(`${LIST_PATH}?saved=1`)
}

export async function deleteGaleriaItem(
  prevState: unknown,
  formData: FormData,
): Promise<GaleriaState> {
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de imagen requerido.' }

    const { data: existing } = await supabase.from('galeria').select('imagen').eq('id', id).single()

    const { error } = await supabase.from('galeria').delete().eq('id', id)

    if (error) return { error: error.message }

    if (existing) await removeMediaUrls(supabase, [existing.imagen])

    revalidateGaleria()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
  redirect(`${LIST_PATH}?saved=1`)
}
