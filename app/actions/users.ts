'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { friendlyError } from '@/lib/friendly-error'

export type UserActionState = { success?: boolean; error?: string } | undefined

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return user
}

/**
 * Sin rol seteado = admin (cuentas creadas antes de este cambio).
 * El rol vive en app_metadata, no en user_metadata: user_metadata lo puede
 * reescribir el propio usuario logueado, app_metadata solo el service_role.
 */
function isAdmin(user: { app_metadata?: Record<string, unknown> }) {
  return (user.app_metadata?.role ?? 'admin') === 'admin'
}

async function requireAdmin() {
  const user = await requireUser()
  if (!isAdmin(user)) throw new Error('Solo un admin puede gestionar usuarios.')
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
    await requireAdmin()

    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const role = formData.get('role') === 'trabajador' ? 'trabajador' : 'admin'

    if (!email || !password) return { error: 'Completá todos los campos.' }
    if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' }

    const admin = createSupabaseAdminClient()
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { must_change_password: true },
      app_metadata: { role },
    })

    if (error) return { error: friendlyError(error) }

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
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
    await requireAdmin()

    const userId = String(formData.get('userId') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (!userId || !password) return { error: 'Completá todos los campos.' }
    if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' }

    const admin = createSupabaseAdminClient()
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      user_metadata: { must_change_password: true },
    })

    if (error) return { error: friendlyError(error) }

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
