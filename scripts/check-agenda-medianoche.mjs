// Reimplementación 1:1 (sin tipos) de cruzaMedianoche/finDiaEfectivo/getEstadoVisual
// (lib/agenda-view.ts) y rangosSeSolapan (lib/agenda-business.ts) tal como quedaron
// tras portar el fix de turno nocturno desde inglobal-agenda-app — mismo patrón que
// ese repo usa en scripts/check-estado-visual.mjs.
//
// ponytail: sin runner de tests acá tampoco (ni jest/vitest ni tsx/ts-node) —
// reimplementación aparte en vez de sumar infraestructura para esto solo. Si
// cruzaMedianoche/finDiaEfectivo/getEstadoVisual/rangosSeSolapan cambian hay que
// actualizar esta copia a mano.
// Correr: node scripts/check-agenda-medianoche.mjs
function toDateInput(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function addDays(d, days) {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}
function cruzaMedianoche(fecha, fechaHasta, horaInicio, horaFinEfectiva) {
  if (fechaHasta === fecha) return false
  return horaFinEfectiva <= horaInicio
}
function finDiaEfectivo(fecha, fechaHasta, horaInicio, horaFinEfectiva) {
  if (fechaHasta) return fechaHasta
  return cruzaMedianoche(fecha, fechaHasta, horaInicio, horaFinEfectiva)
    ? toDateInput(addDays(new Date(`${fecha}T00:00:00`), 1))
    : fecha
}
function getEstadoVisual(evento, now = new Date()) {
  const horaInicioStr = evento.hora_inicio.slice(0, 8)
  const horaFinEfectiva = (evento.hora_fin ?? '23:59:59').slice(0, 8)
  const inicio = new Date(`${evento.fecha}T${horaInicioStr}`)
  const finDiaStr = finDiaEfectivo(evento.fecha, evento.fecha_hasta, horaInicioStr, horaFinEfectiva)
  const fin = new Date(`${finDiaStr}T${horaFinEfectiva}`)
  if (evento.estado === 'reserva') {
    if (inicio <= now) return 'cancelado'
  } else if (evento.estado === 'programado') {
    if (fin < now) return 'finalizado'
    if (inicio <= now) return 'en_curso'
  } else if (evento.estado === 'en_curso') {
    if (fin < now) return 'finalizado'
  }
  return evento.estado
}
function finInstante(ev) {
  const horaFinEfectiva = ev.hora_fin ?? '23:59'
  const finDia = finDiaEfectivo(ev.fecha, ev.fecha_hasta, ev.hora_inicio, horaFinEfectiva)
  return `${finDia}T${horaFinEfectiva}`
}
function rangosSeSolapan(a, b) {
  const inicioA = `${a.fecha}T${a.hora_inicio}`
  const inicioB = `${b.fecha}T${b.hora_inicio}`
  return inicioA < finInstante(b) && inicioB < finInstante(a)
}

let fails = 0
function assertEq(label, actual, expected) {
  const ok = actual === expected
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}: got ${actual}, expected ${expected}`)
  if (!ok) fails++
}

// getEstadoVisual — turno nocturno sin fecha_hasta (20:00, cierra a las
// 23:59:59 default acá, a diferencia del 18:00 de inglobal-agenda-app): antes
// del fix, `fin` caía en el mismo día a las 23:59:59 (después de 20:00, no
// antes) así que ESTE caso puntual no mostraba el bug — el caso que sí lo
// mostraba es 22:00→02:00 sin hora_fin explícita, con default 23:59:59 <
// 22:00 sería falso... hace falta hora_fin explícita <= hora_inicio.
const evNocturno = { fecha: '2026-08-27', fecha_hasta: null, hora_inicio: '22:00:00', hora_fin: '02:00:00', estado: 'programado' }
assertEq('nocturno antes de empezar (21:00)', getEstadoVisual(evNocturno, new Date('2026-08-27T21:00:00')), 'programado')
assertEq('nocturno en curso (23:00) — antes del fix daba "finalizado"', getEstadoVisual(evNocturno, new Date('2026-08-27T23:00:00')), 'en_curso')
assertEq('nocturno post-medianoche (28 01:00)', getEstadoVisual(evNocturno, new Date('2026-08-28T01:00:00')), 'en_curso')
assertEq('nocturno terminado (28 03:00)', getEstadoVisual(evNocturno, new Date('2026-08-28T03:00:00')), 'finalizado')

// Caso diurno normal (no debe romperse por el fix): 08:00-13:00
const evDiurno = { fecha: '2026-08-27', fecha_hasta: null, hora_inicio: '08:00:00', hora_fin: '13:00:00', estado: 'programado' }
assertEq('diurno antes (07:00)', getEstadoVisual(evDiurno, new Date('2026-08-27T07:00:00')), 'programado')
assertEq('diurno en curso (10:00)', getEstadoVisual(evDiurno, new Date('2026-08-27T10:00:00')), 'en_curso')
assertEq('diurno terminado (14:00)', getEstadoVisual(evDiurno, new Date('2026-08-27T14:00:00')), 'finalizado')

// rangosSeSolapan — antes del fix, un turno nocturno sin fecha_hasta nunca
// conflictuaba con nada (intervalo invertido): la misma grúa se podía doble
// reservar de 22:00 a 02:00 sin que nada lo detecte.
const turnoNocturnoA = { fecha: '2026-09-05', fecha_hasta: null, hora_inicio: '22:00', hora_fin: '02:00' }
const turnoQueChocaALaNoche = { fecha: '2026-09-05', fecha_hasta: null, hora_inicio: '23:00', hora_fin: '23:30' }
const turnoQueChocaPostMedianoche = { fecha: '2026-09-06', fecha_hasta: null, hora_inicio: '01:00', hora_fin: '01:30' }
const turnoQueNoChoca = { fecha: '2026-09-06', fecha_hasta: null, hora_inicio: '10:00', hora_fin: '11:00' }
assertEq('solapa mismo día (23:00-23:30 vs 22:00-02:00) — antes daba false', rangosSeSolapan(turnoNocturnoA, turnoQueChocaALaNoche), true)
assertEq('solapa post-medianoche (01:00-01:30 vs 22:00-02:00) — antes daba false', rangosSeSolapan(turnoNocturnoA, turnoQueChocaPostMedianoche), true)
assertEq('no solapa (10:00-11:00 vs 22:00-02:00)', rangosSeSolapan(turnoNocturnoA, turnoQueNoChoca), false)

// NOTA: el mismo cálculo también se corrigió en la constraint/trigger SQL
// (supabase/migrations/030_eventos_agenda_no_overlap_medianoche.sql) — eso no
// se puede verificar acá sin una base Postgres real; se prueba a mano
// insertando el caso 22:00→02:00 sin fecha_hasta tras aplicar la migración.

process.exit(fails === 0 ? 0 : 1)
