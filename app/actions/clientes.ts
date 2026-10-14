'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { getSessionUser, getServerDb } from '@/lib/session'
import { friendlyError } from '@/lib/friendly-error'
import { clienteSchema } from '@/lib/validations/cliente'
import { removeMediaUrls } from '@/lib/storage'
import { nextFreeOrder } from '@/lib/ordering'
import { uniqueSlug } from '@/lib/clientes-business'

export type ClienteState = { success?: boolean; error?: string } | undefined
const LIST_PATH = '/dashboard/clientes'

async function requireUser() {
  const db = await getServerDb()
  const user = await getSessionUser()
  if (!user) throw new Error('No autenticado.')
  return db
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
    const db = await requireUser()

    const parsed = clienteSchema.safeParse({
      name:      formData.get('name'),
      logo:      formData.get('logo'),
      logo_focal: formData.get('logo_focal'),
      logo_focal_mobile: formData.get('logo_focal_mobile'),
      bio:       formData.get('bio'),
      content:   formData.get('content'),
      tiene_blog: formData.get('tiene_blog'),
      featured:  formData.get('featured'),
      work_rank: formData.get('work_rank'),
      published: formData.get('published'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const slug = await uniqueSlug(db, slugify(parsed.data.name, { lower: true, strict: true }))
    const work_rank = await nextFreeOrder(db, 'clientes', 'work_rank', parsed.data.work_rank)

    const { error } = await db.from('clientes').insert({
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
    const db = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de cliente requerido.' }

    const parsed = clienteSchema.safeParse({
      name:      formData.get('name'),
      logo:      formData.get('logo'),
      logo_focal: formData.get('logo_focal'),
      logo_focal_mobile: formData.get('logo_focal_mobile'),
      bio:       formData.get('bio'),
      content:   formData.get('content'),
      tiene_blog: formData.get('tiene_blog'),
      featured:  formData.get('featured'),
      work_rank: formData.get('work_rank'),
      published: formData.get('published'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const { data: existing } = await db.from('clientes').select('slug, name').eq('id', id).single()
    let slug = existing?.slug
    if (existing && existing.name !== parsed.data.name) {
      slug = await uniqueSlug(db, slugify(parsed.data.name, { lower: true, strict: true }), id)
    }
    const work_rank = await nextFreeOrder(db, 'clientes', 'work_rank', parsed.data.work_rank, { excludeId: id })

    const { error } = await db
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
    const db = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de cliente requerido.' }

    const { data: existing } = await db.from('clientes').select('logo').eq('id', id).single()

    const { error } = await db.from('clientes').delete().eq('id', id)

    if (error) return { error: friendlyError(error) }

    if (existing) await removeMediaUrls([existing.logo])

    revalidateClientes()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect(`${LIST_PATH}?saved=deleted`)
}
