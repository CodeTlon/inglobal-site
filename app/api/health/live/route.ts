export const dynamic = 'force-dynamic'

/**
 * Liveness: responde 200 si el proceso de Node atiende requests, sin tocar la base.
 * Es el HEALTHCHECK del contenedor (Dockerfile y compose). Si usara la base, una caída o
 * demora de Postgres dejaría al contenedor "unhealthy" y Traefik devolvería 503
 * ("no available server") incluso a páginas que sí degradan bien a datos de fallback.
 * La salud de la base se consulta en /api/health (monitoreo y CI).
 */
export function GET() {
  return Response.json({ ok: true, status: 'live' })
}
