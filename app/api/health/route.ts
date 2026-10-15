import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Healthcheck para Coolify y monitoreo: responde 200 solo si la base contesta. */
export async function GET() {
  try {
    await db.pool().query('select 1')
    // `started_at` (arranque del proceso) permite a CI saber que ya corre el contenedor del deploy que acaba de pedir.
    // `ok` se mantiene por compatibilidad con lo que ya lo consultaba.
    return Response.json({
      ok: true,
      status: 'ok',
      started_at: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    })
  } catch {
    return Response.json({ ok: false, status: 'db_error' }, { status: 503 })
  }
}
