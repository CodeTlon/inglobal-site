import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Healthcheck para Coolify y monitoreo: responde 200 solo si la base contesta. */
export async function GET() {
  try {
    await db.pool().query('select 1')
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 503 })
  }
}
