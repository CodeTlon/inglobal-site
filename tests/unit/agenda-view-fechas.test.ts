import test from 'node:test'
import assert from 'node:assert/strict'
import { fromDateInput, toDateInput, getWeekStart, getWeekDays, getMonthMatrix, nombreDiaCorto, hoyArgentina, mesActualArgentina } from '../../lib/agenda-view'

// Regresión del calendario descompaginado: el título de la semana lo renderizaba el servidor (UTC)
// y las columnas el cliente (Argentina, UTC-3). Un `Date` cruza ese límite como INSTANTE, no como
// fecha civil, así que el servidor mandaba 2026-10-19T00:00:00Z y el navegador leía sábado 18 a las
// 21:00: header "19 oct – 25 oct" contra columnas "18 … 24", lunes siempre vacío y domingo sin
// dibujar. Ahora cruza un string 'YYYY-MM-DD' y el cliente lo reconstruye con fromDateInput.

test('fromDateInput parsea la fecha civil, no un instante UTC', () => {
  const d = fromDateInput('2026-10-19')
  assert.equal(d.getFullYear(), 2026)
  assert.equal(d.getMonth(), 9) // octubre
  assert.equal(d.getDate(), 19)
  // El bug de origen: sin el sufijo de hora el motor lo toma como UTC, así que en una zona al
  // oeste de Greenwich (Argentina, UTC-3) el día civil retrocede. Solo se puede comparar donde
  // hay offset — con la máquina en UTC los dos instantes coinciden y no habría nada que probar.
  if (d.getTimezoneOffset() > 0) {
    assert.equal(new Date('2026-10-19').getDate(), 18)
    assert.equal(d.getDate(), 19)
  }
})

test('fromDateInput y toDateInput son inversas en cualquier zona de la máquina', () => {
  for (const key of ['2026-01-01', '2026-10-19', '2026-10-25', '2026-11-01', '2026-12-31']) {
    assert.equal(toDateInput(fromDateInput(key)), key)
  }
})

test('la semana reconstruida desde el string arranca el lunes y llega al domingo', () => {
  const days = getWeekDays(fromDateInput('2026-10-19'))
  assert.deepEqual(days.map(toDateInput), [
    '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25',
  ])
  // Lo que se veía mal: el primer número de columna tiene que ser 19, no 18.
  assert.equal(days[0].getDate(), 19)
  assert.equal(days[6].getDate(), 25)
})

test('el nombre del día no puede desalinearse del número', () => {
  // Antes el rótulo salía de un array fijo por posición y el número del Date: la columna
  // "MAR 19" era en realidad el lunes 19.
  const days = getWeekDays(fromDateInput('2026-10-19'))
  assert.deepEqual(days.map(nombreDiaCorto), ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'])
  assert.equal(nombreDiaCorto(fromDateInput('2026-10-19')), 'Lun')
  assert.equal(nombreDiaCorto(fromDateInput('2026-10-25')), 'Dom')
})

test('getWeekStart cae en el lunes incluso partiendo de un domingo', () => {
  assert.equal(toDateInput(getWeekStart(fromDateInput('2026-10-25'))), '2026-10-19') // domingo
  assert.equal(toDateInput(getWeekStart(fromDateInput('2026-10-19'))), '2026-10-19') // lunes
  assert.equal(toDateInput(getWeekStart(fromDateInput('2026-10-22'))), '2026-10-19') // jueves
})

test('la grilla mensual de la TV dibuja el mes del monthKey', () => {
  // ?month=2026-11 mostraba "noviembre" en el header y octubre en la grilla.
  const weeks = getMonthMatrix(fromDateInput('2026-11-01'))
  const delMes = weeks.flat().filter((d) => d.getMonth() === 10)
  assert.equal(delMes.length, 30) // noviembre completo
  assert.equal(toDateInput(delMes[0]), '2026-11-01')
  assert.equal(toDateInput(delMes[29]), '2026-11-30')
})

test('hoyArgentina es una fecha válida y mesActualArgentina su mes', () => {
  const hoy = hoyArgentina()
  assert.match(hoy, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(toDateInput(fromDateInput(hoy)), hoy)
  assert.equal(mesActualArgentina(), hoy.slice(0, 7))
})
