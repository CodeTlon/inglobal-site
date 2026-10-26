import test from 'node:test'
import assert from 'node:assert/strict'
import { agruparPorDia, etiquetaDia, filtrarEventos, hastaDelRango, rangoDias } from '../../lib/agenda-lista'

const ev = (id: string, fecha: string, hora: string, extra: object = {}) => ({
  id, fecha, hora_inicio: `${hora}:00`, estado: 'programado', empresa_id: 'e1', ubicacion: 'Obra Norte', empresa: { nombre: 'Constructora Sur' }, gruas: [{ id: 'g1', nombre: 'Grove 200' }], ...extra,
})

test('rangoDias: solo 7/14/30/60, el resto cae en 14', () => {
  assert.equal(rangoDias('30'), 30)
  assert.equal(rangoDias('999'), 14)
  assert.equal(rangoDias(undefined), 14)
})

test('hastaDelRango suma días sobre la fecha de pared', () => {
  assert.equal(hastaDelRango('2026-10-26', 14), '2026-11-09')
  assert.equal(hastaDelRango('2026-12-25', 7), '2027-01-01')
})

test('agruparPorDia: ordena por día y hora; lo que arrancó antes se muestra en `desde`', () => {
  const g = agruparPorDia([ev('c', '2026-10-27', '08:00'), ev('b', '2026-10-26', '14:00'), ev('a', '2026-10-26', '08:00'), ev('x', '2026-10-24', '09:00', { fecha_hasta: '2026-10-27' })], '2026-10-26')
  assert.deepEqual(g.map((d) => d.fecha), ['2026-10-26', '2026-10-27'])
  assert.deepEqual(g[0].eventos.map((e) => e.id), ['a', 'x', 'b'])
})

test('filtrarEventos: estado, grúa, empresa y texto sin acentos', () => {
  const lista = [ev('1', '2026-10-26', '08:00'), ev('2', '2026-10-26', '09:00', { estado: 'reserva', empresa_id: 'e2', empresa: { nombre: 'Refinería Centro' }, gruas: [{ id: 'g2', nombre: 'Hidro 15' }] })]
  assert.deepEqual(filtrarEventos(lista, { estado: 'reserva' }).map((e) => e.id), ['2'])
  assert.deepEqual(filtrarEventos(lista, { gruaId: 'g1' }).map((e) => e.id), ['1'])
  assert.deepEqual(filtrarEventos(lista, { empresaId: 'e2' }).map((e) => e.id), ['2'])
  assert.deepEqual(filtrarEventos(lista, { q: 'refineria' }).map((e) => e.id), ['2'])
  assert.equal(filtrarEventos(lista, {}).length, 2)
})

test('etiquetaDia: Hoy, Mañana o día corto', () => {
  assert.match(etiquetaDia('2026-10-26', '2026-10-26'), /^Hoy · /)
  assert.match(etiquetaDia('2026-10-27', '2026-10-26'), /^Mañana · /)
  assert.doesNotMatch(etiquetaDia('2026-10-29', '2026-10-26'), /Hoy|Mañana/)
})
