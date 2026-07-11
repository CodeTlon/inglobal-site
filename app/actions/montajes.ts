'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { montajeSchema } from '@/lib/validations/montaje'
import { removeMediaUrls } from '@/lib/storage'
import { nextFreeOrder } from '@/lib/ordering'

export type MontajeState = { success?: boolean; error?: string } | undefined

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

function parseTags(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function revalidateMontajes() {
  revalidatePath('/montajes')
  revalidatePath('/montajes/[slug]', 'page')
  revalidatePath('/dashboard/montajes')
}

export async function createMontaje(
  prevState: unknown,
  formData: FormData,
): Promise<MontajeState> {
  try {
    const supabase = await requireUser()

    const parsed = montajeSchema.safeParse({
      slug:          formData.get('slug'),
      title:         formData.get('title'),
      excerpt:       formData.get('excerpt'),
      content:       formData.get('content'),
      cover_image:   formData.get('cover_image'),
      tags:          formData.get('tags'),
      display_order: formData.get('display_order'),
      published:     formData.get('published'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const { tags, ...rest } = parsed.data
    rest.display_order = await nextFreeOrder(supabase, 'montajes', 'display_order', rest.display_order)

    const { error } = await supabase.from('montajes').insert({
      ...rest,
      tags:       parseTags(tags),
      updated_at: new Date().toISOString(),
    })

    if (error) return { error: error.message }

    revalidateMontajes()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}

export async function updateMontaje(
  prevState: unknown,
  formData: FormData,
): Promise<MontajeState> {
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de montaje requerido.' }

    const parsed = montajeSchema.safeParse({
      slug:          formData.get('slug'),
      title:         formData.get('title'),
      excerpt:       formData.get('excerpt'),
      content:       formData.get('content'),
      cover_image:   formData.get('cover_image'),
      tags:          formData.get('tags'),
      display_order: formData.get('display_order'),
      published:     formData.get('published'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const { tags, ...rest } = parsed.data
    rest.display_order = await nextFreeOrder(supabase, 'montajes', 'display_order', rest.display_order, { excludeId: id })

    const { error } = await supabase
      .from('montajes')
      .update({ ...rest, tags: parseTags(tags), updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidateMontajes()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}

export async function deleteMontaje(
  prevState: unknown,
  formData: FormData,
): Promise<MontajeState> {
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de montaje requerido.' }

    const { data: existing } = await supabase.from('montajes').select('cover_image').eq('id', id).single()

    const { error } = await supabase.from('montajes').delete().eq('id', id)

    if (error) return { error: error.message }

    if (existing) await removeMediaUrls(supabase, [existing.cover_image])

    revalidateMontajes()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}
