import test from 'node:test'
import assert from 'node:assert/strict'
import { estadoTransicionado, rangosSeSolapan } from '../../lib/agenda-business'
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

// Las horas del evento son de Córdoba (UTC-3); el servidor corre en UTC. Los instantes se dan con offset explícito
// para que el test pase igual en cualquier zona de la máquina.
const enCurso = { estado: 'en_curso' as const, fecha: '2030-01-10', fecha_hasta: null, hora_inicio: '09:00:00', hora_fin: '12:00:00' }

test('un evento no se finaliza antes de su hora de fin en Córdoba', () => {
  assert.equal(estadoTransicionado(enCurso, new Date('2030-01-10T11:30:00-03:00')), null)
  assert.equal(estadoTransicionado(enCurso, new Date('2030-01-10T14:30:00Z')), null) // 11:30 en Córdoba
})

test('un evento se finaliza pasada su hora de fin en Córdoba', () => {
  assert.equal(estadoTransicionado(enCurso, new Date('2030-01-10T12:01:00-03:00')), 'finalizado')
})

test('una reserva se cancela recién al llegar su hora de inicio en Córdoba', () => {
  const reserva = { ...enCurso, estado: 'reserva' as const }
  assert.equal(estadoTransicionado(reserva, new Date('2030-01-10T11:00:00Z')), null) // 08:00 en Córdoba
  assert.equal(estadoTransicionado(reserva, new Date('2030-01-10T12:00:00Z')), 'cancelado') // 09:00
})
