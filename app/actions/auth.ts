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
