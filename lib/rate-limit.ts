import { db } from '@/lib/db'

/**
 * Rate limit con los contadores en Postgres (tabla `rate_limits`): se comparten entre instancias y
 * sobreviven a un reinicio. Si la base falla, cae a un contador en memoria del proceso para no dejar el
 * endpoint sin ningún límite (y tampoco bloquearlo): sigue siendo un guard "best effort", no una garantía.
 * Consumidores: `app/actions/contact.ts`, `app/api/tv-pair/start` y el login (`lib/auth.ts`, vía `consumirContador`).
 */
const SQL = `
  insert into rate_limits (clave, cuenta, vence_at) values ($1, 1, now() + make_interval(secs => $2))
  on conflict (clave) do update set
    cuenta = case when rate_limits.vence_at <= now() then 1 else rate_limits.cuenta + 1 end,
    vence_at = case when rate_limits.vence_at <= now() then now() + make_interval(secs => $2) else rate_limits.vence_at end
  returning cuenta, greatest(1, ceil(extract(epoch from (vence_at - now()))))::int as resta`

const memoria = new Map<string, { count: number; resetAt: number }>()

function enMemoria(clave: string, ventanaSeg: number, max: number): { permitido: boolean; reintentarEnSeg: number } {
  const now = Date.now()
  const entry = memoria.get(clave)
  if (!entry || now > entry.resetAt) {
    // Limpieza oportunista para que el Map no crezca sin techo.
    if (memoria.size > 5000) for (const [k, v] of memoria) if (now > v.resetAt) memoria.delete(k)
    memoria.set(clave, { count: 1, resetAt: now + ventanaSeg * 1000 })
    return { permitido: true, reintentarEnSeg: 0 }
  }
  entry.count += 1
  return { permitido: entry.count <= max, reintentarEnSeg: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) }
}

/**
 * Anota una petición contra `clave` en una ventana de `ventanaSeg` segundos y dice si todavía entra dentro de
 * `max`. Atómico (un solo `insert ... on conflict`), así que N peticiones simultáneas no se cuelan juntas.
 */
export async function consumirContador(clave: string, ventanaSeg: number, max: number): Promise<{ permitido: boolean; reintentarEnSeg: number }> {
  try {
    const pool = db.pool()
    const { rows } = await pool.query<{ cuenta: number; resta: number }>(SQL, [clave, ventanaSeg])
    // Barrido de filas vencidas, de a poco (1 de cada 50 llamadas) para no pagarlo siempre.
    if (Math.random() < 0.02) void pool.query(`delete from rate_limits where vence_at < now() - interval '1 hour'`).catch(() => {})
    const cuenta = rows[0]?.cuenta ?? 1
    return { permitido: cuenta <= max, reintentarEnSeg: rows[0]?.resta ?? ventanaSeg }
  } catch (e) {
    console.error('[rate-limit] base no disponible, uso memoria:', e instanceof Error ? e.message : e)
    return enMemoria(clave, ventanaSeg, max)
  }
}

export function createRateLimiter(nombre: string, windowMs: number, maxRequests: number) {
  return async function isRateLimited(key: string): Promise<boolean> {
    return !(await consumirContador(`${nombre}:${key}`, windowMs / 1000, maxRequests)).permitido
  }
}
