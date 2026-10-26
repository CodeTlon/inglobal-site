'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import { hashPassword } from '@/lib/password'
import { friendlyError } from '@/lib/friendly-error'

export type AuthState = { error?: string } | undefined

/**
 * Único mensaje de login fallido. Es deliberadamente el mismo tanto si el email
 * no existe como si la contraseña está mal: si el texto variara, cualquiera
 * podría enumerar qué cuentas existen probando emails contra el login.
 */
const LOGIN_ERROR = 'Credenciales incorrectas. Verificá tu email y contraseña.'

/** Evita open redirect: solo rutas internas del panel o de la TV. */
function safeNext(next: string): string {
  return /^\/(dashboard|agenda-tv)(\/|$|\?)/.test(next) && !next.startsWith('//') ? next : '/dashboard'
}

/**
 * Iniciar sesión con email y contraseña.
 * En caso de éxito redirige al dashboard (no retorna).
 */
export async function signIn(prevState: unknown, formData: FormData): Promise<AuthState> {
  const email    = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next     = safeNext(String(formData.get('next') ?? '/dashboard'))

  if (!email || !password) {
    return { error: 'Completá todos los campos.' }
  }

  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() })
  } catch (e) {
    console.error('signIn error:', e instanceof Error ? e.message : e)
    // Mismo mensaje y mismo comportamiento exista o no la cuenta: el form siempre conserva el email.
    // (Limpiarlo solo cuando la cuenta no existe permitía averiguar qué emails tienen cuenta.)
    return { error: LOGIN_ERROR }
  }

  redirect(next)
}

/**
 * Cerrar sesión y redirigir al login.
 */
export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() }).catch(() => {})
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

  const user = await getSessionUser()
  if (!user) return { error: friendlyError(new Error('not authenticated')) }

  const { error } = await db
    .from('account')
    .update({ password: await hashPassword(password), updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('provider_id', 'credential')
  if (error) return { error: friendlyError(error, 'No se pudo cambiar la contraseña. Intentá de nuevo.') }

  await db.from('user').update({ must_change_password: false, updated_at: new Date().toISOString() }).eq('id', user.id)

  redirect('/dashboard')
}
