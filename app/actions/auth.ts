'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { emailExistsInAuth } from '@/lib/auth-email'
import { friendlyError } from '@/lib/friendly-error'

export type AuthState = { error?: string; clearEmail?: boolean } | undefined

/**
 * Único mensaje de login fallido. Es deliberadamente el mismo tanto si el email
 * no existe como si la contraseña está mal: si el texto variara, cualquiera
 * podría enumerar qué cuentas existen probando emails contra el login.
 */
const LOGIN_ERROR = 'Credenciales incorrectas. Verificá tu email y contraseña.'

/**
 * Iniciar sesión con email y contraseña.
 * En caso de éxito redirige al dashboard (no retorna).
 */
export async function signIn(prevState: unknown, formData: FormData): Promise<AuthState> {
  const email    = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next     = String(formData.get('next') ?? '/dashboard')

  if (!email || !password) {
    return { error: 'Completá todos los campos.' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('signIn error:', error.message)
    // El texto del error NO cambia; lo único que cambia es si el form conserva
    // el email tipeado (contraseña equivocada → se conserva para reintentar) o
    // lo limpia (ese email no tiene cuenta → no sirve reintentar con él).
    // Si no se pudo verificar (`null`), se conserva: nunca hacerle perder el
    // dato al usuario por un error nuestro.
    const exists = await emailExistsInAuth(email)
    return { error: LOGIN_ERROR, clearEmail: exists === false }
  }

  redirect(next)
}

/**
 * Cerrar sesión y redirigir al login.
 */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/dashboard/login')
}

/**
 * Cambia la contraseña del usuario logueado (mismo form sirve para el gate
 * obligatorio del primer login y para el cambio voluntario desde el panel).
 * Limpia `must_change_password` si estaba en true.
 */
export async function changePassword(prevState: unknown, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (!password || !confirmPassword) return { error: 'Completá todos los campos.' }
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  if (password !== confirmPassword) return { error: 'Las contraseñas no coinciden.' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({
    password,
    data: { must_change_password: false },
  })

  if (error) return { error: friendlyError(error, 'No se pudo cambiar la contraseña. Intentá de nuevo.') }

  redirect('/dashboard')
}
