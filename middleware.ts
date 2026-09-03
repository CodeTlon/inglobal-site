import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
    const url = request.nextUrl.clone()
    if (isAgendaTv) {
      // ponytail: log temporal — un usuario reportó que una TV ya logueada
      // volvió a pedir el QR después de un deploy; esto ayuda a confirmar
      // si es un refresh token vencido/reusado o algo del lado de Supabase
      // la próxima vez que pase. Sacar cuando se confirme la causa.
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

  // Rol "trabajador": su acceso es la app mobile (solo agenda). El panel web
  // completo (clientes, servicios, usuarios, etc.) queda reservado a admin.
  // isCambiarPassword queda afuera del bloqueo: es la única pantalla del panel
  // que un trabajador puede necesitar (contraseña temporal en el primer ingreso).
  // Cierra la sesión web acá mismo — si solo redirigiéramos a /dashboard/login
  // seguiría autenticado y la regla de arriba lo volvería a mandar a /dashboard.
  const isTrabajador = user?.app_metadata?.role === 'trabajador'
  if (isDashboard && !isLogin && !isCambiarPassword && isTrabajador) {
    await supabase.auth.signOut()
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/login'
    url.search = ''
    url.searchParams.set('sin_acceso', '1')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/agenda-tv/:path*'],
}
