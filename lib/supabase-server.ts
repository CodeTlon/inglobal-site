import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder'

/**
 * Cliente Supabase para Server Components y Server Actions.
 * Lee y escribe cookies para mantener la sesión de Supabase Auth.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(URL, ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Server Component sin permisos para escribir cookies;
          // el middleware refresca la sesión en cada request.
        }
      },
    },
  })
}

/**
 * Cliente admin (service_role). Solo usar en archivos 'use server'.
 * NUNCA exponer en variables NEXT_PUBLIC_*.
 */
export function createSupabaseAdminClient() {
  return createClient(URL, SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
