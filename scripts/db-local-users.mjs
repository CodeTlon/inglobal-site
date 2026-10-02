#!/usr/bin/env node
// Crea (idempotente) las cuentas de prueba en el Supabase LOCAL.
// Uso: npm run db:local:users   (después de `npm run db:local:up`)
//
// SEGURIDAD: se niega a correr si la URL no es local. Las credenciales de abajo
// son de desarrollo y NO deben existir nunca en homologación ni producción.
import { execSync } from 'node:child_process'

const USERS = [
  { email: 'admin-local@inglobal.test', password: 'Local-Test-1234', nombre: 'Admin local' },
  { email: 'operador-local@inglobal.test', password: 'Local-Test-1234', nombre: 'Operador local' },
]

const env = {}
for (const line of execSync('npx supabase status -o env', { encoding: 'utf8' }).split('\n')) {
  const m = line.match(/^([A-Z_]+)="?(.*?)"?$/)
  if (m) env[m[1]] = m[2]
}
const url = env.API_URL
const key = env.SERVICE_ROLE_KEY
if (!url || !key) throw new Error('No pude leer el estado del stack local. ¿Corriste `npm run db:local:up`?')
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url)) {
  throw new Error(`Abortado: ${url} no es un Supabase local.`)
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

for (const u of USERS) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: u.email,
      password: u.password,
      email_confirm: true,
      // must_change_password=false: si no, la API /api/* responde 403.
      user_metadata: { full_name: u.nombre, must_change_password: false },
    }),
  })
  if (res.ok) console.log(`creado: ${u.email}`)
  else if (res.status === 422) console.log(`ya existe: ${u.email}`)
  else throw new Error(`${u.email}: ${res.status} ${await res.text()}`)
}
console.log('\nCuentas locales (contraseña de prueba):')
for (const u of USERS) console.log(`  ${u.email}  /  ${u.password}`)
