/**
 * Se ejecuta una vez al arrancar el servidor (no en el build). Aplica las migraciones
 * de drizzle/ antes de atender requests, así un deploy nuevo en Coolify deja la base
 * al día sin un paso manual. Desactivable con RUN_MIGRATIONS=false.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.RUN_MIGRATIONS === 'false' || !process.env.DATABASE_URL) return
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const path = await import('node:path')
  const { migrate } = await import('drizzle-orm/node-postgres/migrator')
  const { drizzle } = await import('drizzle-orm/node-postgres')
  const { db } = await import('@/lib/db')

  await migrate(drizzle({ client: db.pool() }), { migrationsFolder: path.join(process.cwd(), 'drizzle') })
  console.log('[migrate] migraciones al día')
}
