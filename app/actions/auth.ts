'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type AuthState = { error?: string } | undefined

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
    return { error: 'Credenciales incorrectas. Verificá tu email y contraseña.' }
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

  if (error) return { error: error.message }

  redirect('/dashboard')
}
