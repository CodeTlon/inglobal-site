'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import { hashPassword } from '@/lib/password'
import { friendlyError } from '@/lib/friendly-error'

export type UserActionState = { success?: boolean; error?: string } | undefined

async function requireUser() {
  const user = await getSessionUser()
  if (!user) throw new Error('No autenticado.')
  return user
}

/**
 * Crea una cuenta nueva (sin signup público — solo accesible a quien ya esté
 * logueado en el panel). No hay flujo de verificación por mail. Un solo rol para
 * todo: cualquier cuenta tiene acceso total al panel web y a la app mobile
 * (ver .ai/context/DECISIONS.md). Nace con contraseña temporal.
 */
export async function createAdminUser(
  prevState: unknown,
  formData: FormData,
): Promise<UserActionState> {
  try {
    await requireUser()

    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const password = String(formData.get('password') ?? '')

    if (!email || !password) return { error: 'Completá todos los campos.' }
    if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' }

    const { data: existe } = await db.from('user').select('id').eq('email', email).limit(1)
    if (existe && existe.length > 0) return { error: 'Ya existe un usuario con ese email.' }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const { error: userError } = await db.from('user').insert({
      id,
      name: email.split('@')[0],
      email,
      email_verified: true,
      must_change_password: true,
      created_at: now,
      updated_at: now,
    })
    if (userError) return { error: friendlyError(userError) }

    const { error: accountError } = await db.from('account').insert({
      id: crypto.randomUUID(),
      account_id: id,
      provider_id: 'credential',
      user_id: id,
      password: await hashPassword(password),
      created_at: now,
      updated_at: now,
    })
    if (accountError) {
      await db.from('user').delete().eq('id', id)
      return { error: friendlyError(accountError) }
    }

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}

/**
 * Resetea la contraseña de cualquier cuenta existente (incluida la propia).
 * Reemplaza al flujo de "olvidé mi contraseña": otra cuenta logueada
 * la cambia acá y se la pasa por fuera del sistema. Cierra las sesiones
 * abiertas de esa cuenta.
 */
export async function resetAdminPassword(
  prevState: unknown,
  formData: FormData,
): Promise<UserActionState> {
  try {
    await requireUser()

    const userId = String(formData.get('userId') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (!userId || !password) return { error: 'Completá todos los campos.' }
    if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' }

    const now = new Date().toISOString()
    const { data, error } = await db
      .from('account')
      .update({ password: await hashPassword(password), updated_at: now })
      .eq('user_id', userId)
      .eq('provider_id', 'credential')
      .select('id')
    if (error) return { error: friendlyError(error) }
    if (!data || data.length === 0) return { error: 'No se encontró la cuenta.' }

    await db.from('user').update({ must_change_password: true, updated_at: now }).eq('id', userId)
    await db.from('session').delete().eq('user_id', userId)

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
