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
 * Valida el Bearer token contra Supabase Auth y devuelve el cliente + usuario, o `null`
 * si no hay token o no es válido — usar al principio de todo Route Handler protegido.
 */
export async function requireApiUser(request: Request) {
  const supabase = createSupabaseFromBearer(request)
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return { supabase, user }
}

export function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export function apiData<T>(data: T, status = 200) {
  return Response.json({ data }, { status })
}
