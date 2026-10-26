import test from 'node:test'
import assert from 'node:assert/strict'
import { clientIp } from '../../lib/client-ip'
import { cronAutorizado } from '../../lib/cron-auth'
import { filtrosEventosSchema } from '../../lib/validations/agenda'

const h = (o: Record<string, string>) => new Headers(o)

test('clientIp: usa el último salto de X-Forwarded-For (el del proxy), no el primero que manda el cliente', () => {
  assert.equal(clientIp(h({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9' })), '203.0.113.9')
  assert.equal(clientIp(h({ 'x-forwarded-for': '203.0.113.9' })), '203.0.113.9')
  assert.equal(clientIp(h({ 'x-real-ip': '198.51.100.1' })), '198.51.100.1')
  assert.equal(clientIp(h({})), 'unknown')
})

test('cronAutorizado: exige el Bearer exacto y rechaza todo sin CRON_SECRET', () => {
  const previo = process.env.CRON_SECRET
  try {
    delete process.env.CRON_SECRET
    assert.equal(cronAutorizado(new Request('http://x', { headers: { authorization: 'Bearer algo' } })), false)
    process.env.CRON_SECRET = 'secreto-de-prueba'
    assert.equal(cronAutorizado(new Request('http://x', { headers: { authorization: 'Bearer secreto-de-prueba' } })), true)
    assert.equal(cronAutorizado(new Request('http://x', { headers: { authorization: 'Bearer otro-secreto-xxx' } })), false)
    assert.equal(cronAutorizado(new Request('http://x')), false)
  } finally {
    if (previo === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = previo
  }
})

test('filtrosEventosSchema: solo fechas reales e ids uuid (el `desde` entra a un filtro .or())', () => {
  assert.ok(filtrosEventosSchema.safeParse({ desde: '2026-10-26', hasta: '2026-11-01' }).success)
  assert.ok(filtrosEventosSchema.safeParse({}).success)
  assert.equal(filtrosEventosSchema.safeParse({ desde: '2026-10-26,fecha.gte.2000-01-01' }).success, false)
  assert.equal(filtrosEventosSchema.safeParse({ desde: '2026-13-45' }).success, false)
  assert.equal(filtrosEventosSchema.safeParse({ gruaId: 'no-es-uuid' }).success, false)
})
