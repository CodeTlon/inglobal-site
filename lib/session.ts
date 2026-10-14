import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export type SessionUser = {
  id: string
  email: string
  name: string
  mustChangePassword: boolean
}

/** Usuario de la sesión actual (cookie), o `null`. Para Server Components y Server Actions. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null
  const u = session.user as typeof session.user & { mustChangePassword?: boolean }
  return { id: u.id, email: u.email, name: u.name, mustChangePassword: u.mustChangePassword === true }
}

/** Igual que getSessionUser pero lanza si no hay sesión. Primera línea de toda mutación. */
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new Error('No autenticado.')
  return user
}

/**
 * Acceso a datos para Server Actions. Ya no hay RLS: la autorización es
 * `requireSessionUser()` antes de usar este objeto.
 */
export async function getServerDb() {
  return db
}
