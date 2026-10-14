/**
 * Datos de desarrollo local: seed ficticio (ZZ-PRUEBA, db/seed-local.sql) y cuentas de prueba.
 * Solo contra una base LOCAL (se niega si DATABASE_URL no apunta a localhost).
 *   npm run db:local:setup            migra y siembra
 *   npm run db:local:reset            vacía las tablas y vuelve a sembrar
 */
import fs from 'node:fs'
import path from 'node:path'
import { Pool } from 'pg'
import { hashPassword } from '../lib/password'

const url = process.env.DATABASE_URL ?? 'postgres://inglobal:inglobal@127.0.0.1:41510/inglobal'
if (!/@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) throw new Error(`Abortado: ${url.replace(/:[^:@]*@/, ':***@')} no es una base local.`)

const USERS = [
  { email: 'admin-local@inglobal.test', password: 'Local-Test-1234', nombre: 'Admin local' },
  { email: 'operador-local@inglobal.test', password: 'Local-Test-1234', nombre: 'Operador local' },
]

async function main() {
  const pool = new Pool({ connectionString: url })
  try {
    if (process.argv.includes('--reset')) {
      await pool.query(`truncate tv_pairing_codes, push_tokens, notificaciones_enviadas, eventos_operarios, eventos_agenda,
        trabajos, clientes, montajes, servicios, galeria, gruas, empresas_agenda, operarios, contact_leads,
        site_settings, session, account, verification, "user" restart identity cascade`)
    }
    await pool.query(fs.readFileSync(path.join(__dirname, '..', 'db', 'seed-local.sql'), 'utf8'))
    for (const u of USERS) {
      const id = crypto.randomUUID()
      const r = await pool.query(
        `insert into "user" (id, name, email, email_verified, must_change_password) values ($1,$2,$3,true,false)
         on conflict (email) do nothing returning id`,
        [id, u.nombre, u.email],
      )
      if (r.rowCount) {
        await pool.query(
          `insert into account (id, account_id, provider_id, user_id, password) values ($1,$2,'credential',$2,$3)`,
          [crypto.randomUUID(), id, await hashPassword(u.password)],
        )
        console.log(`creado: ${u.email}`)
      } else console.log(`ya existe: ${u.email}`)
    }
    console.log('\nCuentas locales (contraseña de prueba):')
    for (const u of USERS) console.log(`  ${u.email}  /  ${u.password}`)
  } finally {
    await pool.end()
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
