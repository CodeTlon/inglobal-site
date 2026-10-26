import test from 'node:test'
import assert from 'node:assert/strict'
import { armarAvisoReserva, armarResumenManana, lineaEvento, type EventoParaAviso } from '../../lib/notificaciones'

const ev = (hora: string, empresa: string, ...gruas: string[]): EventoParaAviso => ({
  hora_inicio: `${hora}:00`,
  empresa: { nombre: empresa },
  eventos_gruas: gruas.map((nombre, orden) => ({ orden, grua: { nombre } })),
})

test('lineaEvento: empresa primero, grúa después y "+N" si hay varias', () => {
  assert.equal(lineaEvento(ev('08:00', 'Obra Norte', 'Grúa 12')), '08:00 Obra Norte · Grúa 12')
  assert.equal(lineaEvento(ev('08:00', 'Obra Norte', 'Grúa 12', 'Grúa 3', 'Grúa 7')), '08:00 Obra Norte · Grúa 12 +2')
})

test('lineaEvento: usa `grua` si no hay eventos_gruas, y recorta empresas largas', () => {
  const l = lineaEvento({ hora_inicio: '09:30:00', grua: { nombre: 'Grúa 5' }, empresa: { nombre: 'Constructora Mediterránea del Centro S.A.' } })
  assert.equal(l, '09:30 Constructora Mediterrán… · Grúa 5')
})

test('armarResumenManana: sin servicios no hay aviso', () => {
  assert.equal(armarResumenManana([]), null)
})

test('armarResumenManana: 1 servicio', () => {
  const r = armarResumenManana([ev('08:00', 'Obra Norte', 'Grúa 12')])
  assert.equal(r?.title, 'Mañana: 1 servicio a las 08:00')
  assert.equal(r?.body, '08:00 Obra Norte · Grúa 12')
})

test('armarResumenManana: hasta 4 servicios los lista todos, ordenados por hora', () => {
  const r = armarResumenManana([ev('14:00', 'C', 'G3'), ev('08:00', 'A', 'G1'), ev('10:00', 'B', 'G2'), ev('16:00', 'D', 'G4')])
  assert.equal(r?.title, 'Mañana: 4 servicios, desde las 08:00')
  assert.deepEqual(r?.body.split('\n'), ['08:00 A · G1', '10:00 B · G2', '14:00 C · G3', '16:00 D · G4'])
})

test('armarResumenManana: con muchos servicios lista 3 y resume el resto con la hora del último', () => {
  const evs = Array.from({ length: 9 }, (_, i) => ev(`${String(8 + i).padStart(2, '0')}:00`, `Emp ${i + 1}`, `G${i + 1}`))
  const r = armarResumenManana(evs)
  assert.equal(r?.title, 'Mañana: 9 servicios, desde las 08:00')
  const lineas = r!.body.split('\n')
  assert.equal(lineas.length, 4)
  assert.equal(lineas[3], 'y 6 más (último: 16:00)')
})

test('armarAvisoReserva: dice cuándo se cancela', () => {
  const r = armarAvisoReserva(ev('08:00', 'Obra Norte', 'Grúa 12'))
  assert.equal(r.title, 'Reserva sin confirmar')
  assert.equal(r.body, '08:00 Obra Norte · Grúa 12\nSe cancela sola a las 08:00. Confirmala o reprogramala.')
})
