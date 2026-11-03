import test from 'node:test'
import assert from 'node:assert/strict'
import { codigoDeVinculacion } from '../../lib/tv-pair-codigo'

test('codigoDeVinculacion: 6 dígitos en dos grupos, estable por token y distinto entre tokens', () => {
  const a = codigoDeVinculacion('a'.repeat(48))
  assert.match(a, /^\d{3} \d{3}$/)
  assert.equal(codigoDeVinculacion('a'.repeat(48)), a)
  const distintos = new Set(Array.from({ length: 50 }, (_, i) => codigoDeVinculacion(`token-${i}`)))
  assert.ok(distintos.size > 45)
})
