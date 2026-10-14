// Aplica las migraciones de drizzle/ al arrancar el contenedor (idempotente).
// Usa solo drizzle-orm + pg, que ya vienen en el standalone.
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('[migrate] Falta DATABASE_URL')
  process.exit(1)
}
const pool = new pg.Pool({ connectionString: url, max: 1 })
try {
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' })
  console.log('[migrate] migraciones al día')
} catch (e) {
  console.error('[migrate] falló:', e)
  process.exitCode = 1
} finally {
  await pool.end()
}
