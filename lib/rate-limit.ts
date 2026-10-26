import { db } from '@/lib/db'

/**
 * Rate limit con los contadores en Postgres (tabla `rate_limits`): se comparten entre instancias y
 * sobreviven a un reinicio. Si la base falla, cae a un contador en memoria del proceso para no dejar el
 * endpoint sin ningún límite (y tampoco bloquearlo): sigue siendo un guard "best effort", no una garantía.
 * Consumidores: `app/actions/contact.ts` y `app/api/tv-pair/start`. El login lo limita Better Auth (lib/auth.ts).
 */
const SQL = `
  insert into rate_limits (clave, cuenta, vence_at) values ($1, 1, now() + make_interval(secs => $2))
  on conflict (clave) do update set
    cuenta = case when rate_limits.vence_at <= now() then 1 else rate_limits.cuenta + 1 end,
    vence_at = case when rate_limits.vence_at <= now() then now() + make_interval(secs => $2) else rate_limits.vence_at end
  returning cuenta`

export function createRateLimiter(nombre: string, windowMs: number, maxRequests: number) {
  const memoria = new Map<string, { count: number; resetAt: number }>()

  function enMemoria(key: string): boolean {
    const now = Date.now()
    const entry = memoria.get(key)
    if (!entry || now > entry.resetAt) {
      // Limpieza oportunista para que el Map no crezca sin techo.
      if (memoria.size > 5000) for (const [k, v] of memoria) if (now > v.resetAt) memoria.delete(k)
      memoria.set(key, { count: 1, resetAt: now + windowMs })
      return false
    }
    entry.count += 1
    return entry.count > maxRequests
  }

  return async function isRateLimited(key: string): Promise<boolean> {
    try {
      const pool = db.pool()
      const { rows } = await pool.query<{ cuenta: number }>(SQL, [`${nombre}:${key}`, windowMs / 1000])
      // Barrido de filas vencidas, de a poco (1 de cada 50 llamadas) para no pagarlo siempre.
      if (Math.random() < 0.02) void pool.query(`delete from rate_limits where vence_at < now() - interval '1 hour'`).catch(() => {})
      return (rows[0]?.cuenta ?? 1) > maxRequests
    } catch (e) {
      console.error('[rate-limit] base no disponible, uso memoria:', e instanceof Error ? e.message : e)
      return enMemoria(key)
    }
  }
}
