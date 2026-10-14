import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Gate de sesión del panel (/dashboard) y de la TV (/agenda-tv).
 * Corre en runtime Node (acceso a la base para validar la sesión de verdad,
 * no solo la cookie) — mismo comportamiento que tenía con Supabase Auth.
 */
export async function middleware(request: NextRequest) {
  type U = { id: string; mustChangePassword?: boolean }
  let user: U | null = null
  let sessionError = false
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    user = (session?.user as U | undefined) ?? null
  } catch (e) {
    sessionError = true
    console.error('[middleware] error validando sesión:', e instanceof Error ? e.message : e)
  }

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
    // Un error de la base (no "sesión inexistente") en la TV no la desloguea: se
    // deja pasar y el refresco de la TV (cada 60s) reintenta.
    if (isAgendaTv && sessionError) return NextResponse.next()
    const url = request.nextUrl.clone()
    if (isAgendaTv) {
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
  if (isDashboard && !isLogin && !isCambiarPassword && user?.mustChangePassword === true) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/cambiar-password'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/dashboard/:path*', '/agenda-tv/:path*'],
}
