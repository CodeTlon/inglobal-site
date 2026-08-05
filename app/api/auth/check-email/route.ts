import { type NextRequest } from 'next/server'
import { emailExistsInAuth, isValidEmailFormat } from '@/lib/auth-email'
import { apiData, apiError } from '@/lib/supabase-api'

/**
 * POST /api/auth/check-email  ·  body: { email }  →  { data: { exists: boolean } }
 *
 * Existe para `inglobal-app` (Expo), que no tiene backend propio: después de un
 * login fallido necesita saber si conservar el email tipeado o limpiarlo, y esa
 * consulta requiere la service_role key, que jamás puede vivir en la app.
 *
 * Única ruta de `app/api/**` SIN `requireApiUser`, y es a propósito: se llama
 * justamente cuando no hay sesión (login fallido). Devuelve un solo booleano,
 * pero para que no sea un enumerador barato de cuentas se acota con validación
 * de formato + rate limit por IP.
 *
 * OJO: quien consuma esto NUNCA debe cambiar el mensaje de error mostrado al
 * usuario según `exists` — ver `lib/auth-email.ts`.
 */

// Rate limit en memoria del proceso. En Vercel cada instancia serverless tiene
// el suyo, así que es un guard "best effort", no una garantía dura — alcanza
// para que el endpoint no sea trivialmente scrapeable. Si algún día hace falta
// algo real, mover a Upstash/Redis.
const WINDOW_MS = 60_000
const MAX_REQUESTS = 10
const hits = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    // Limpieza oportunista para que el Map no crezca sin techo.
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k)
    }
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  entry.count += 1
  return entry.count > MAX_REQUESTS
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (isRateLimited(ip)) return apiError('Demasiados intentos. Esperá un minuto.', 429)

  let email = ''
  try {
    const body: unknown = await request.json()
    const raw = (body as { email?: unknown })?.email
    email = typeof raw === 'string' ? raw.trim() : ''
  } catch {
    return apiError('Body inválido.', 400)
  }

  if (!isValidEmailFormat(email)) return apiError('Email inválido.', 400)

  const exists = await emailExistsInAuth(email)
  if (exists === null) return apiError('No se pudo verificar el email.', 503)

  return apiData({ exists })
}
