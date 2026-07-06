'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'

export type UserActionState = { success?: boolean; error?: string } | undefined

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return user
}

/**
 * Crea una cuenta admin nueva (sin signup público — solo accesible
 * a quien ya esté logueado en el panel). Confirma el email automáticamente,
 * no hay flujo de verificación por mail.
 */
export async function createAdminUser(
  prevState: unknown,
  formData: FormData,
): Promise<UserActionState> {
  try {
    await requireUser()

    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (!email || !password) return { error: 'Completá todos los campos.' }
    if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' }

    const admin = createSupabaseAdminClient()
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) return { error: error.message }

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}

/**
 * Resetea la contraseña de cualquier admin existente (incluida la propia).
 * Reemplaza al flujo de "olvidé mi contraseña": otro admin logueado
 * la cambia acá y se la pasa por fuera del sistema.
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

    const admin = createSupabaseAdminClient()
    const { error } = await admin.auth.admin.updateUserById(userId, { password })

    if (error) return { error: error.message }

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}
