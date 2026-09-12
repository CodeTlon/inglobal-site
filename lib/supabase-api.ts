/**
 * lib/supabase-api.ts — Auth para Route Handlers (app/api/**) llamados desde la app mobile.
 *
 * A diferencia de createSupabaseServerClient (lib/supabase-server.ts, cookie-based, usado
 * por Server Actions y Server Components del dashboard web), la app mobile no tiene cookies
 * de Next.js — manda su sesión de Supabase como `Authorization: Bearer <jwt>`. Este cliente
 * reenvía ese JWT como header a Supabase, así que el RLS (`auth.role() = 'authenticated'`)
 * se evalúa exactamente igual que con el cliente cookie-based — mismos permisos, sin lógica
 * de autorización duplicada.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export function createSupabaseFromBearer(request: Request): SupabaseClient | null {
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  return createClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Valida el Bearer token contra Supabase Auth y devuelve el cliente + usuario, o el
 * Response de error listo para retornar — usar al principio de todo Route Handler
 * protegido: `const auth = await requireApiUser(request); if (auth instanceof Response) return auth`.
 *
 * Incluye el mismo chequeo de `must_change_password` que `middleware.ts` ya aplica en
 * el dashboard web (`isDashboard && !isLogin && !isCambiarPassword && user?.user_metadata?.must_change_password`)
 * — ese middleware solo corre para `/dashboard/**`/`/agenda-tv/**` (ver `config.matcher`
 * ahí), nunca para `/api/**`, así que sin esto un usuario con contraseña temporal podía
 * seguir operando indefinidamente vía la app mobile sin que el backend se lo impidiera
 * (hallazgo documentado en `inglobal-agenda-app/.ai/context/KNOWN_ISSUES.md`). No hace
 * falta una excepción tipo `isCambiarPassword`: el cambio de contraseña es un Server
 * Action (`app/actions/auth.ts`), no hay ningún Route Handler de `app/api/**` para eso.
 */
export async function requireApiUser(request: Request) {
  const supabase = createSupabaseFromBearer(request)
  if (!supabase) return apiError('No autenticado.', 401)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('No autenticado.', 401)
  if (user.user_metadata?.must_change_password) {
    return apiError('Debés cambiar tu contraseña antes de continuar.', 403)
  }
  return { supabase, user }
}

export function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export function apiData<T>(data: T, status = 200) {
  return Response.json({ data }, { status })
}
