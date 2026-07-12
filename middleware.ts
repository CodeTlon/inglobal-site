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
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isDashboard = path.startsWith('/dashboard')
  const isAgendaTv = path.startsWith('/agenda-tv')
  const isLogin = path === '/dashboard/login'
  const isCambiarPassword = path === '/dashboard/cambiar-password'

  // Sin sesión en rutas protegidas (dashboard + TV de agenda) → redirigir al login
  if ((isDashboard || isAgendaTv) && !isLogin && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/login'
    url.searchParams.set('next', path)
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
