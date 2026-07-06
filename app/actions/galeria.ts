'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { galeriaSchema } from '@/lib/validations/galeria'

export type GaleriaState = { success?: boolean; error?: string } | undefined

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

    const { error } = await supabase.from('galeria').insert({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })

    if (error) return { error: error.message }

    revalidateGaleria()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
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

    const { error } = await supabase
      .from('galeria')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidateGaleria()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}

export async function deleteGaleriaItem(
  prevState: unknown,
  formData: FormData,
): Promise<GaleriaState> {
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de imagen requerido.' }

    const { error } = await supabase.from('galeria').delete().eq('id', id)

    if (error) return { error: error.message }

    revalidateGaleria()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}
