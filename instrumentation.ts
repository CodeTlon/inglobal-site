/**
 * Se ejecuta una vez al arrancar el servidor (no en el build). Aplica las migraciones
 * de drizzle/ antes de atender requests, así un deploy nuevo en Coolify deja la base
 * al día sin un paso manual. Desactivable con RUN_MIGRATIONS=false.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  await prepararBucket()
  if (process.env.RUN_MIGRATIONS === 'false' || !process.env.DATABASE_URL) return

  const path = await import('node:path')
  const { migrate } = await import('drizzle-orm/node-postgres/migrator')
  const { drizzle } = await import('drizzle-orm/node-postgres')
  const { db } = await import('@/lib/db')

  await migrate(drizzle({ client: db.pool() }), { migrationsFolder: path.join(process.cwd(), 'drizzle') })
  console.log('[migrate] migraciones al día')
}

async function prepararBucket() {
  if (process.env.S3_AUTO_BUCKET === 'false' || !process.env.S3_ENDPOINT) return
  const { ensureBucket } = await import('@/lib/storage')
  try {
    await ensureBucket()
    console.log('[storage] bucket listo')
  } catch (e) {
    // No frena el arranque: el sitio funciona sin archivos y se reintenta en el próximo deploy.
    console.error('[storage] no se pudo preparar el bucket:', e instanceof Error ? e.message : e)
  }
}
