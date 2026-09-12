import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { isAuthRetryableFetchError } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(URL, ANON, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isDashboard = path.startsWith('/dashboard')
  const isAgendaTv = path.startsWith('/agenda-tv')
  const isLogin = path === '/dashboard/login'
  const isCambiarPassword = path === '/dashboard/cambiar-password'
  // Pantalla de emparejamiento QR: es precisamente la ruta para una TV SIN sesión
  // todavía (ver app/agenda-tv/pair/page.tsx) — no puede exigir login como el resto.
  const isAgendaTvPair = path === '/agenda-tv/pair'

  // Sin sesión en rutas protegidas → redirigir al login (dashboard) o al QR de
  // emparejamiento (TV: no tiene teclado, no puede completar un login normal).
  if ((isDashboard || isAgendaTv) && !isLogin && !isAgendaTvPair && !user) {
    // Un error transitorio de red contactando a Supabase (típico en un cold
    // start de la función edge justo después de un deploy) no es lo mismo
    // que "no hay sesión" — getUser() también devuelve user: null en ese
    // caso. Antes lo tratábamos igual y mandábamos a la TV a re-emparejar
    // con QR aunque su sesión siguiera siendo válida; ahora, si el error es
    // retryable, dejamos pasar el request tal cual y se reintenta solo en
    // el próximo refresh de la TV (cada 60s, ver AgendaTvRefresher).
    if (isAgendaTv && userError && isAuthRetryableFetchError(userError)) {
      console.error('[middleware] error transitorio validando sesión de TV, no desloggea', {
        message: userError.message,
      })
      return response
    }
    const url = request.nextUrl.clone()
    if (isAgendaTv) {
      // ponytail: log temporal — un usuario reportó que una TV ya logueada
      // volvió a pedir el QR después de un deploy; esto ayuda a confirmar
      // si sigue pasando por otra causa (refresh token vencido/reusado,
      // etc.) ahora que el caso de error transitorio de red está cubierto
      // arriba. Sacar cuando se confirme que ya no pasa.
      console.error('[middleware] TV sin sesión, redirige a /agenda-tv/pair', { userError: userError?.message })
      url.pathname = '/agenda-tv/pair'
    } else {
      url.pathname = '/dashboard/login'
      url.searchParams.set('next', path)
    }
    return NextResponse.redirect(url)
  }

  // Ya autenticado intentando entrar al login → redirigir al dashboard
  if (isLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Contraseña temporal (alta nueva o reset) sin cambiar → forzar a cambiarla
  // antes de dejar entrar a cualquier otra ruta del panel.
  if (isDashboard && !isLogin && !isCambiarPassword && user?.user_metadata?.must_change_password) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/cambiar-password'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/agenda-tv/:path*'],
}
