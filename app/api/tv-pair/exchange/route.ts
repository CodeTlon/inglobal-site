import { NextResponse } from 'next/server'
import { serializeSignedCookie } from 'better-call'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// Navegación de browser (la TV hace window.location = acá), no fetch. Valida el código
// aprobado desde la app, abre una sesión de Better Auth para el usuario que lo aprobó,
// deja la cookie de sesión firmada y redirige a la agenda.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  // Detrás del proxy de Coolify `request.url` puede traer el host interno: las
  // redirecciones usan siempre la URL pública configurada.
  const base = process.env.BETTER_AUTH_URL ?? request.url
  const failUrl = new URL('/agenda-tv/pair?error=1', base)
  if (!token) return NextResponse.redirect(failUrl)

  const { data: pairing, error: pairingError } = await db.from('tv_pairing_codes').select('*').eq('token', token).single()
  if (pairingError) console.error('[tv-pair/exchange] lookup falló:', pairingError.message)
  if (!pairing || pairing.status !== 'approved' || !pairing.approved_by) {
    console.error('[tv-pair/exchange] pairing no aprobado:', pairing?.status ?? 'no existe')
    return NextResponse.redirect(failUrl)
  }
  if (new Date(pairing.expires_at) < new Date()) {
    console.error('[tv-pair/exchange] token expirado')
    return NextResponse.redirect(failUrl)
  }

  // Un solo uso: se consume ANTES de crear la sesión, así dos requests simultáneos
  // con el mismo código no abren dos sesiones.
  const { data: consumed } = await db
    .from('tv_pairing_codes')
    .update({ status: 'consumed' })
    .eq('token', token)
    .eq('status', 'approved')
    .select('id')
  if (!consumed || consumed.length === 0) return NextResponse.redirect(failUrl)

  try {
    const ctx = await auth.$context
    const session = await ctx.internalAdapter.createSession(pairing.approved_by)
    const { name, attributes } = ctx.authCookies.sessionToken
    const cookie = await serializeSignedCookie(name, session.token, ctx.secret, {
      ...attributes,
      maxAge: ctx.sessionConfig.expiresIn,
    })
    const response = NextResponse.redirect(new URL('/agenda-tv', base))
    response.headers.append('set-cookie', cookie)
    return response
  } catch (e) {
    console.error('[tv-pair/exchange] no se pudo abrir la sesión:', e instanceof Error ? e.message : e)
    return NextResponse.redirect(failUrl)
  }
}
