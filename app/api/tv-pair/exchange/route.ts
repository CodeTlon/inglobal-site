import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

// Navegación de browser (la TV hace window.location = acá), no fetch — establece la
// sesión real con cookies vía @supabase/ssr (mismo patrón que middleware.ts) y redirige.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const failUrl = new URL('/agenda-tv/pair?error=1', request.url)
  if (!token) return NextResponse.redirect(failUrl)

  const admin = createSupabaseAdminClient()
  const { data: pairing, error: pairingError } = await admin.from('tv_pairing_codes').select('*').eq('token', token).single()
  if (pairingError) console.error('[tv-pair/exchange] lookup falló:', pairingError.message)
  if (!pairing || pairing.status !== 'approved' || !pairing.approved_by) {
    console.error('[tv-pair/exchange] pairing no aprobado:', pairing?.status ?? 'no existe')
    return NextResponse.redirect(failUrl)
  }
  if (new Date(pairing.expires_at) < new Date()) {
    console.error('[tv-pair/exchange] token expirado')
    return NextResponse.redirect(failUrl)
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(pairing.approved_by)
  const email = userData?.user?.email
  if (!email) {
    console.error('[tv-pair/exchange] no se encontró el email del usuario:', userError?.message)
    return NextResponse.redirect(failUrl)
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
  const hashedToken = linkData?.properties?.hashed_token
  if (linkError || !hashedToken) {
    console.error('[tv-pair/exchange] generateLink falló:', linkError?.message)
    return NextResponse.redirect(failUrl)
  }

  const response = NextResponse.redirect(new URL('/agenda-tv', request.url))
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: hashedToken,
  })
  if (verifyError) {
    console.error('[tv-pair/exchange] verifyOtp falló:', verifyError.message)
    return NextResponse.redirect(failUrl)
  }

  await admin.from('tv_pairing_codes').update({ status: 'consumed' }).eq('token', token)

  return response
}
