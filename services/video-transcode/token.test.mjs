import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createToken, validToken } from './token.js'

test('token válido pasa', () => {
  const t = createToken('secret')
  assert.equal(validToken(t, 'secret'), true)
})

test('secreto incorrecto falla', () => {
  const t = createToken('secret')
  assert.equal(validToken(t, 'otro'), false)
})

test('token vencido falla', () => {
  const t = createToken('secret', -1000)
  assert.equal(validToken(t, 'secret'), false)
})

test('token basura/vacío falla', () => {
  assert.equal(validToken('nonsense', 'secret'), false)
  assert.equal(validToken('', 'secret'), false)
  assert.equal(validToken(null, 'secret'), false)
})
