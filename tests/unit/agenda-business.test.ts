import test from 'node:test'
import assert from 'node:assert/strict'
import { rangosSeSolapan } from '../../lib/agenda-business'
import { crearEventoSchema, eventoAgendaSchema } from '../../lib/validations/agenda'

const w = (fecha: string, hora_inicio: string, hora_fin: string | null, fecha_hasta: string | null = null) => ({ fecha, hora_inicio, hora_fin, fecha_hasta })

test('servicios pegados no se solapan (HH:MM vs HH:MM:SS)', () => {
  assert.equal(rangosSeSolapan(w('2030-01-10', '08:00:00', '12:00:00'), w('2030-01-10', '12:00', '14:00')), false)
  assert.equal(rangosSeSolapan(w('2030-01-10', '12:00', '14:00'), w('2030-01-10', '08:00:00', '12:00:00')), false)
})

test('solapamiento real y turno nocturno', () => {
  assert.equal(rangosSeSolapan(w('2030-01-10', '08:00:00', '12:00:00'), w('2030-01-10', '11:59', '14:00')), true)
  assert.equal(rangosSeSolapan(w('2030-01-10', '22:00:00', '02:00:00'), w('2030-01-11', '01:00', '03:00')), true)
  assert.equal(rangosSeSolapan(w('2030-01-10', '22:00:00', '02:00:00'), w('2030-01-11', '02:00', '03:00')), false)
})

test('validación de formatos y estado inicial', () => {
  const base = { fecha: '2099-01-10', hora_inicio: '08:00', hora_fin: '10:00', grua_id: crypto.randomUUID(), empresa_id: crypto.randomUUID() }
  assert.equal(crearEventoSchema.safeParse(base).success, true)
  assert.equal(crearEventoSchema.safeParse({ ...base, hora_fin: '', fecha_hasta: '' }).success, true)
  assert.equal(crearEventoSchema.safeParse({ ...base, hora_fin: null, fecha_hasta: null }).success, true)
  assert.equal(crearEventoSchema.safeParse({ ...base, fecha: '31-02-2099' }).success, false)
  assert.equal(crearEventoSchema.safeParse({ ...base, fecha: '2099-02-31' }).success, false)
  assert.equal(crearEventoSchema.safeParse({ ...base, hora_inicio: '25:99' }).success, false)
  assert.equal(crearEventoSchema.safeParse({ ...base, estado: 'finalizado' }).success, false)
  assert.equal(eventoAgendaSchema.safeParse({ ...base, fecha: '2020-01-01', estado: 'finalizado' }).success, true)
})
