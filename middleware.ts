import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Gate de sesión del panel (/dashboard) y de la TV (/agenda-tv).
 * Corre en runtime Node (acceso a la base para validar la sesión de verdad,
 * no solo la cookie) — mismo comportamiento que tenía con Supabase Auth.
 */
/**
 * Redirect a una ruta del propio sitio. Se arma con la URL pública (BETTER_AUTH_URL), no con
 * `request.nextUrl`: detrás del proxy de Coolify el host que ve Next es el interno
 * (localhost / 0.0.0.0) y la redirección mandaba al navegador a una dirección inalcanzable.
 */
function redirectTo(request: NextRequest, pathname: string, params?: Record<string, string>) {
  const base = process.env.BETTER_AUTH_URL ?? request.url
  const url = new URL(pathname, base)
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v)
  return NextResponse.redirect(url)
}

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
    if (isAgendaTv) return redirectTo(request, '/agenda-tv/pair')
    return redirectTo(request, '/dashboard/login', { next: path })
  }

  // Ya autenticado intentando entrar al login → redirigir al dashboard
  if (isLogin && user) {
    return redirectTo(request, '/dashboard')
  }

  // Contraseña temporal (alta nueva o reset) sin cambiar → forzar a cambiarla
  // antes de dejar entrar a cualquier otra ruta del panel.
  if (isDashboard && !isLogin && !isCambiarPassword && user?.mustChangePassword === true) {
    return redirectTo(request, '/dashboard/cambiar-password')
  }

  return NextResponse.next()
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/dashboard/:path*', '/agenda-tv/:path*'],
}
