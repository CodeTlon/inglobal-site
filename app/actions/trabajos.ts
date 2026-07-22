'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { friendlyError } from '@/lib/friendly-error'
import { trabajoSchema } from '@/lib/validations/trabajo'
import { removeMediaUrls } from '@/lib/storage'
import { nextFreeOrder } from '@/lib/ordering'

export type TrabajoState = { success?: boolean; error?: string } | undefined

type ServerSupabase = Awaited<ReturnType<typeof createSupabaseServerClient>>

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

async function uniqueSlug(supabase: ServerSupabase, clienteId: string, base: string, excludeId?: string) {
  let slug = base
  let n = 2
  while (true) {
    const { data } = await supabase
      .from('trabajos')
      .select('id')
      .eq('cliente_id', clienteId)
      .eq('slug', slug)
      .limit(1)
    if (!data || data.length === 0) return slug
    if (excludeId && data[0].id === excludeId) return slug
    slug = `${base}-${n++}`
  }
}

/** Revalida las páginas afectadas y devuelve el slug del cliente (para redirigir a su listado de trabajos). */
async function revalidateTrabajos(supabase: ServerSupabase, clienteId: string): Promise<string | null> {
  const { data: cliente } = await supabase.from('clientes').select('slug').eq('id', clienteId).single()
  if (!cliente) return null
  revalidatePath(`/clientes/${cliente.slug}`)
  revalidatePath(`/clientes/${cliente.slug}/[trabajo]`, 'page')
  revalidatePath(`/dashboard/clientes/${cliente.slug}/trabajos`)
  return cliente.slug
}

function parse(formData: FormData) {
  return trabajoSchema.safeParse({
    cliente_id:    formData.get('cliente_id'),
    title:         formData.get('title'),
    excerpt:       formData.get('excerpt'),
    content:       formData.get('content'),
    cover_image:   formData.get('cover_image'),
    youtube_url:   formData.get('youtube_url'),
    fecha:         formData.get('fecha') || null,
    attachment_url: formData.get('attachment_url'),
    cover_image_focal: formData.get('cover_image_focal'),
    cover_image_focal_mobile: formData.get('cover_image_focal_mobile'),
    banner_image:  formData.get('banner_image'),
    banner_image_focal: formData.get('banner_image_focal'),
    banner_image_focal_mobile: formData.get('banner_image_focal_mobile'),
    banner_overlay_opacity: formData.get('banner_overlay_opacity') || 100,
    banner_overlay_opacity_mobile: formData.get('banner_overlay_opacity_mobile') || null,
    display_order: formData.get('display_order'),
    published:     formData.get('published'),
  })
}

export async function createTrabajo(
  prevState: unknown,
  formData: FormData,
): Promise<TrabajoState> {
  let clienteSlug: string | null = null
  try {
    const supabase = await requireUser()

    const parsed = parse(formData)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const { cliente_id, title, ...rest } = parsed.data
    const baseSlug = slugify(title, { lower: true, strict: true })
    const slug = await uniqueSlug(supabase, cliente_id, baseSlug)
    rest.display_order = await nextFreeOrder(supabase, 'trabajos', 'display_order', rest.display_order, {
      scopeColumn: 'cliente_id',
      scopeValue: cliente_id,
    })

    const { error } = await supabase.from('trabajos').insert({
      cliente_id,
      title,
      slug,
      ...rest,
      updated_at: new Date().toISOString(),
    })

    if (error) return { error: friendlyError(error) }

    clienteSlug = await revalidateTrabajos(supabase, cliente_id)
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect(clienteSlug ? `/dashboard/clientes/${clienteSlug}/trabajos?saved=created` : '/dashboard/clientes?saved=created')
}

export async function updateTrabajo(
  prevState: unknown,
  formData: FormData,
): Promise<TrabajoState> {
  let clienteSlug: string | null = null
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de trabajo requerido.' }

    const parsed = parse(formData)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const { cliente_id, title, ...rest } = parsed.data

    const { data: existing } = await supabase.from('trabajos').select('slug, title').eq('id', id).single()
    let slug = existing?.slug
    if (existing && existing.title !== title) {
      const baseSlug = slugify(title, { lower: true, strict: true })
      slug = await uniqueSlug(supabase, cliente_id, baseSlug, id)
    }
    rest.display_order = await nextFreeOrder(supabase, 'trabajos', 'display_order', rest.display_order, {
      scopeColumn: 'cliente_id',
      scopeValue: cliente_id,
      excludeId: id,
    })

    const { error } = await supabase
      .from('trabajos')
      .update({ cliente_id, title, slug, ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: friendlyError(error) }

    clienteSlug = await revalidateTrabajos(supabase, cliente_id)
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect(clienteSlug ? `/dashboard/clientes/${clienteSlug}/trabajos?saved=updated` : '/dashboard/clientes?saved=updated')
}

export async function deleteTrabajo(
  prevState: unknown,
  formData: FormData,
): Promise<TrabajoState> {
  let clienteSlug: string | null = null
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de trabajo requerido.' }

    const { data: existing } = await supabase.from('trabajos').select('cliente_id, cover_image, banner_image, attachment_url').eq('id', id).single()

    const { error } = await supabase.from('trabajos').delete().eq('id', id)
    if (error) return { error: friendlyError(error) }

    if (existing) {
      await removeMediaUrls(supabase, [existing.cover_image, existing.banner_image, existing.attachment_url])
      clienteSlug = await revalidateTrabajos(supabase, existing.cliente_id)
    }
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect(clienteSlug ? `/dashboard/clientes/${clienteSlug}/trabajos?saved=deleted` : '/dashboard/clientes?saved=deleted')
}
