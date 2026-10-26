import test from 'node:test'
import assert from 'node:assert/strict'
import { paginaPedida, paginar } from '../../lib/paginacion'

test('paginaPedida: entero >= 1, lo demás vale 1', () => {
  assert.equal(paginaPedida('3'), 3)
  assert.equal(paginaPedida('0'), 1)
  assert.equal(paginaPedida('-2'), 1)
  assert.equal(paginaPedida('abc'), 1)
  assert.equal(paginaPedida(undefined), 1)
})

test('paginar: corta, acota la página y calcula el total', () => {
  const lista = Array.from({ length: 25 }, (_, i) => i + 1)
  assert.deepEqual(paginar(lista, 1, 10), { items: lista.slice(0, 10), pagina: 1, totalPaginas: 3 })
  assert.deepEqual(paginar(lista, 3, 10).items, [21, 22, 23, 24, 25])
  assert.equal(paginar(lista, 99, 10).pagina, 3)
  assert.deepEqual(paginar([], 1, 10), { items: [], pagina: 1, totalPaginas: 1 })
})
