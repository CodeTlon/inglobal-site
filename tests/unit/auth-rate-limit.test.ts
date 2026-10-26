/**
 * Límites del login (lib/auth.ts): por IP (Better Auth con los contadores en Postgres) y por cuenta (hook propio).
 * Necesita una base local con migraciones y las cuentas de prueba (`npm run db:local:setup`). El rate limit de
 * Better Auth solo corre con NODE_ENV=production, así que el test lo fuerza antes de importar:
 *   DATABASE_URL=postgres://inglobal:inglobal@127.0.0.1:41510/inglobal npx tsx --test tests/unit/auth-rate-limit.test.ts
 */
import test, { after } from 'node:test'
import assert from 'node:assert/strict'

const hayBase = /@(127\.0\.0\.1|localhost)(:\d+)?\//.test(process.env.DATABASE_URL ?? '')
const ORIGEN = 'http://localhost:3999'

async function intentar(email: string, ip: string): Promise<number> {
  const { auth } = await import('../../lib/auth')
  const res = await auth.handler(
    new Request(`${ORIGEN}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGEN, 'x-forwarded-for': ip },
      body: JSON.stringify({ email, password: 'contraseña-incorrecta' }),
    }),
  )
  return res.status
}

if (hayBase) {
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
  process.env.BETTER_AUTH_URL = ORIGEN
  process.env.BETTER_AUTH_SECRET ??= 'secreto-de-prueba-0123456789abcdef0123456789'
}

after(async () => {
  if (!hayBase) return
  const { db } = await import('../../lib/db')
  await db.pool().query(`delete from rate_limits where clave like 'ba:%zz-auth-test%' or clave like 'login-email:zz-auth-test%'`)
  await db.pool().end()
})

test('login: la misma IP queda bloqueada (429) pasados los 10 intentos por minuto', { skip: !hayBase && 'sin base local' }, async () => {
  const estados: number[] = []
  for (let i = 0; i < 12; i++) estados.push(await intentar('zz-auth-test-ip@inglobal.test', '203.0.113.50'))
  assert.ok(estados.slice(0, 10).every((s) => s !== 429), `los primeros 10 no deben dar 429: ${estados}`)
  assert.equal(estados[11], 429)
})

test('login: una cuenta queda bloqueada aunque el atacante cambie de IP en cada intento', { skip: !hayBase && 'sin base local' }, async () => {
  const estados: number[] = []
  for (let i = 0; i < 22; i++) estados.push(await intentar('zz-auth-test-cuenta@inglobal.test', `198.51.100.${i + 1}`))
  assert.ok(estados.slice(0, 20).every((s) => s !== 429), `los primeros 20 no deben dar 429: ${estados}`)
  assert.equal(estados[21], 429)
})
