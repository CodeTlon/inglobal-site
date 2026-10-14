'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { getSessionUser, getServerDb } from '@/lib/session'
import type { Db } from '@/lib/db'
import { friendlyError } from '@/lib/friendly-error'
import { montajeSchema } from '@/lib/validations/montaje'
import { removeMediaUrls } from '@/lib/storage'
import { nextFreeOrder } from '@/lib/ordering'

export type MontajeState = { success?: boolean; error?: string } | undefined
const LIST_PATH = '/dashboard/montajes'

type ServerSupabase = Db

async function requireUser() {
  const db = await getServerDb()
  const user = await getSessionUser()
  if (!user) throw new Error('No autenticado.')
  return db
}

async function uniqueSlug(db: ServerSupabase, base: string, excludeId?: string) {
  let slug = base
  let n = 2
  while (true) {
    const { data } = await db.from('montajes').select('id').eq('slug', slug).limit(1)
    if (!data || data.length === 0) return slug
    if (excludeId && data[0].id === excludeId) return slug
    slug = `${base}-${n++}`
  }
}

// StringList (Field.tsx) serializa el input oculto como JSON — no CSV.
function parseTags(raw: string | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string' && t.trim() !== '') : []
  } catch {
    return []
  }
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
    const db = await requireUser()

    const parsed = montajeSchema.safeParse({
      title:         formData.get('title'),
      excerpt:       formData.get('excerpt'),
      content:       formData.get('content'),
      cover_image:   formData.get('cover_image'),
      cover_image_focal: formData.get('cover_image_focal'),
      cover_image_focal_mobile: formData.get('cover_image_focal_mobile'),
      banner_image:  formData.get('banner_image'),
      banner_image_focal: formData.get('banner_image_focal'),
      banner_image_focal_mobile: formData.get('banner_image_focal_mobile'),
      tags:          formData.get('tags'),
      display_order: formData.get('display_order'),
      published:     formData.get('published'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const { tags, title, ...rest } = parsed.data
    const slug = await uniqueSlug(db, slugify(title, { lower: true, strict: true }))
    rest.display_order = await nextFreeOrder(db, 'montajes', 'display_order', rest.display_order)

    const { error } = await db.from('montajes').insert({
      title,
      slug,
      ...rest,
      tags:       parseTags(tags),
      updated_at: new Date().toISOString(),
    })

    if (error) return { error: friendlyError(error) }

    revalidateMontajes()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect(`${LIST_PATH}?saved=created`)
}

export async function updateMontaje(
  prevState: unknown,
  formData: FormData,
): Promise<MontajeState> {
  try {
    const db = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de montaje requerido.' }

    const parsed = montajeSchema.safeParse({
      title:         formData.get('title'),
      excerpt:       formData.get('excerpt'),
      content:       formData.get('content'),
      cover_image:   formData.get('cover_image'),
      cover_image_focal: formData.get('cover_image_focal'),
      cover_image_focal_mobile: formData.get('cover_image_focal_mobile'),
      banner_image:  formData.get('banner_image'),
      banner_image_focal: formData.get('banner_image_focal'),
      banner_image_focal_mobile: formData.get('banner_image_focal_mobile'),
      tags:          formData.get('tags'),
      display_order: formData.get('display_order'),
      published:     formData.get('published'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    }

    const { tags, title, ...rest } = parsed.data

    const { data: existing } = await db.from('montajes').select('slug, title').eq('id', id).single()
    let slug = existing?.slug
    if (existing && existing.title !== title) {
      slug = await uniqueSlug(db, slugify(title, { lower: true, strict: true }), id)
    }
    rest.display_order = await nextFreeOrder(db, 'montajes', 'display_order', rest.display_order, { excludeId: id })

    const { error } = await db
      .from('montajes')
      .update({ title, slug, ...rest, tags: parseTags(tags), updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: friendlyError(error) }

    revalidateMontajes()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect(`${LIST_PATH}?saved=updated`)
}

export async function deleteMontaje(
  prevState: unknown,
  formData: FormData,
): Promise<MontajeState> {
  try {
    const db = await requireUser()

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de montaje requerido.' }

    const { data: existing } = await db.from('montajes').select('cover_image, banner_image').eq('id', id).single()

    const { error } = await db.from('montajes').delete().eq('id', id)

    if (error) return { error: friendlyError(error) }

    if (existing) await removeMediaUrls([existing.cover_image, existing.banner_image])

    revalidateMontajes()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect(`${LIST_PATH}?saved=deleted`)
}
