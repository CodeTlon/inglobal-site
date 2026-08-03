'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { friendlyError } from '@/lib/friendly-error'
import { clienteSchema } from '@/lib/validations/cliente'
import { removeMediaUrls } from '@/lib/storage'
import { nextFreeOrder } from '@/lib/ordering'
import { uniqueSlug } from '@/lib/clientes-business'

export type ClienteState = { success?: boolean; error?: string } | undefined
const LIST_PATH = '/dashboard/clientes'

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

function revalidateClientes() {
  revalidatePath('/clientes')
  revalidatePath('/clientes/[slug]', 'page')
  revalidatePath('/')            // sección clientes_destacados del home
  revalidatePath('/dashboard/clientes')
}

export async function createCliente(
  prevState: unknown,
  formData: FormData,
): Promise<ClienteState> {
  try {
    const supabase = await requireUser()

    const parsed = clienteSchema.safeParse({
      name:      formData.get('name'),
      logo:      formData.get('logo'),
      logo_focal: formData.get('logo_focal'),
      logo_focal_mobile: formData.get('logo_focal_mobile'),
      bio:       formData.get('bio'),
      content:   formData.get('content'),
      featured:  formData.get('featured'),
      work_rank: formData.get('work_rank'),
      published: formData.get('published'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const slug = await uniqueSlug(supabase, slugify(parsed.data.name, { lower: true, strict: true }))
    const work_rank = await nextFreeOrder(supabase, 'clientes', 'work_rank', parsed.data.work_rank)

    const { error } = await supabase.from('clientes').insert({
      ...parsed.data,
      slug,
      work_rank,
      updated_at: new Date().toISOString(),
    })

    if (error) return { error: friendlyError(error) }

    revalidateClientes()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect(`${LIST_PATH}?saved=created`)
}

export async function updateCliente(
  prevState: unknown,
  formData: FormData,
): Promise<ClienteState> {
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de cliente requerido.' }

    const parsed = clienteSchema.safeParse({
      name:      formData.get('name'),
      logo:      formData.get('logo'),
      logo_focal: formData.get('logo_focal'),
      logo_focal_mobile: formData.get('logo_focal_mobile'),
      bio:       formData.get('bio'),
      content:   formData.get('content'),
      featured:  formData.get('featured'),
      work_rank: formData.get('work_rank'),
      published: formData.get('published'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const { data: existing } = await supabase.from('clientes').select('slug, name').eq('id', id).single()
    let slug = existing?.slug
    if (existing && existing.name !== parsed.data.name) {
      slug = await uniqueSlug(supabase, slugify(parsed.data.name, { lower: true, strict: true }), id)
    }
    const work_rank = await nextFreeOrder(supabase, 'clientes', 'work_rank', parsed.data.work_rank, { excludeId: id })

    const { error } = await supabase
      .from('clientes')
      .update({ ...parsed.data, slug, work_rank, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: friendlyError(error) }

    revalidateClientes()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect(`${LIST_PATH}?saved=updated`)
}

export async function deleteCliente(
  prevState: unknown,
  formData: FormData,
): Promise<ClienteState> {
  try {
    const supabase = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de cliente requerido.' }

    const { data: existing } = await supabase.from('clientes').select('logo').eq('id', id).single()

    const { error } = await supabase.from('clientes').delete().eq('id', id)

    if (error) return { error: friendlyError(error) }

    if (existing) await removeMediaUrls(supabase, [existing.logo])

    revalidateClientes()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect(`${LIST_PATH}?saved=deleted`)
}
