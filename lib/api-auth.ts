/**
 * lib/api-auth.ts — auth para Route Handlers (app/api/**) que consume la app mobile.
 * La app manda su sesión de Better Auth como `Authorization: Bearer <token>`
 * (plugin bearer); el sitio web usa la cookie. `auth.api.getSession` resuelve ambos.
 */

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * Valida la sesión y devuelve `{ db, user }`, o el Response de error listo para
 * retornar. Usar al principio de todo Route Handler protegido:
 * `const a = await requireApiUser(request); if (a instanceof Response) return a`.
 *
 * Incluye el chequeo de `must_change_password` que aplica el middleware al panel
 * web: ese middleware nunca corre para `/api/**`, así que sin esto un usuario con
 * contraseña temporal podría operar indefinidamente desde la app.
 */
export async function requireApiUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return apiError('No autenticado.', 401)
  const user = session.user as typeof session.user & { mustChangePassword?: boolean }
  if (user.mustChangePassword === true) {
    return apiError('Debés cambiar tu contraseña antes de continuar.', 403)
  }
  return { db, user: { id: user.id, email: user.email } }
}

export function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export function apiData<T>(data: T, status = 200) {
  return Response.json({ data }, { status })
}
