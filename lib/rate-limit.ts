/**
 * Rate limit en memoria del proceso. En Vercel cada instancia serverless tiene
 * el suyo, así que es un guard "best effort", no una garantía dura — alcanza
 * para que un endpoint/action público no sea trivialmente abusable. Si algún
 * día hace falta algo real, mover a Upstash/Redis.
 *
 * Extraído de `app/api/auth/check-email/route.ts` (primer consumidor) para
 * reusar el mismo mecanismo en `app/actions/contact.ts`.
 */
export function createRateLimiter(windowMs: number, maxRequests: number) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return function isRateLimited(key: string): boolean {
    const now = Date.now()
    const entry = hits.get(key)

    if (!entry || now > entry.resetAt) {
      // Limpieza oportunista para que el Map no crezca sin techo.
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k)
      }
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return false
    }

    entry.count += 1
    return entry.count > maxRequests
  }
}
