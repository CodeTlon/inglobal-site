/**
 * Rate limit con contadores en Postgres (migración 0005). Necesita una base local con migraciones aplicadas:
 *   DATABASE_URL=postgres://inglobal:inglobal@127.0.0.1:41510/inglobal npx tsx --test tests/unit/rate-limit.test.ts
 */
import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../../lib/db'
import { createRateLimiter } from '../../lib/rate-limit'

const hayBase = /@(127\.0\.0\.1|localhost)(:\d+)?\//.test(process.env.DATABASE_URL ?? '')
const PREFIJO = 'zz-test-'

after(async () => {
  if (hayBase) await db.pool().query(`delete from rate_limits where clave like $1`, [`${PREFIJO}%`])
  await db.pool().end()
})

test('rate limit en Postgres: deja pasar hasta el máximo, bloquea el siguiente y separa por clave', { skip: !hayBase && 'sin base local' }, async () => {
  const limitado = createRateLimiter(`${PREFIJO}a`, 60_000, 3)
  assert.deepEqual([await limitado('1.1.1.1'), await limitado('1.1.1.1'), await limitado('1.1.1.1')], [false, false, false])
  assert.equal(await limitado('1.1.1.1'), true)
  assert.equal(await limitado('2.2.2.2'), false)
})

test('rate limit en Postgres: los contadores se comparten entre instancias y vencen con la ventana', { skip: !hayBase && 'sin base local' }, async () => {
  const a = createRateLimiter(`${PREFIJO}b`, 1_000, 1)
  const b = createRateLimiter(`${PREFIJO}b`, 1_000, 1)
  assert.equal(await a('3.3.3.3'), false)
  assert.equal(await b('3.3.3.3'), true)
  await new Promise((r) => setTimeout(r, 1_150))
  assert.equal(await a('3.3.3.3'), false)
})

test('consumirContador: devuelve cuántos segundos faltan para que se libere la ventana', { skip: !hayBase && 'sin base local' }, async () => {
  const { consumirContador } = await import('../../lib/rate-limit')
  assert.equal((await consumirContador(`${PREFIJO}c`, 30, 1)).permitido, true)
  const r = await consumirContador(`${PREFIJO}c`, 30, 1)
  assert.equal(r.permitido, false)
  assert.ok(r.reintentarEnSeg >= 1 && r.reintentarEnSeg <= 30)
})
