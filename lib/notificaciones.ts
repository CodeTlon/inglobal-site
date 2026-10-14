/**
 * Lógica pura de las notificaciones push (sin acceso a datos ni red) — la usa
 * app/api/agenda/cron/notificar. Todo se calcula en horario de Córdoba
 * (UTC-3 fijo, Argentina no tiene DST): el servidor de Vercel corre en UTC y
 * `toDateInput` (lib/agenda-view.ts) usa la hora local del servidor, que acá
 * no sirve.
 */

const OFFSET_ARG_MS = -3 * 60 * 60 * 1000

/** Hora de recordatorio del día siguiente (hora de Córdoba). */
export const HORA_RECORDATORIO = 19
/** Una reserva se avisa cuando falta menos de esto para su `hora_inicio` (se auto-cancela ahí). */
export const VENTANA_RESERVA_MIN = 120

export type FechaHoraAr = { fecha: string; minutosDelDia: number }

/** Fecha (YYYY-MM-DD) y minutos desde medianoche, en horario de Córdoba. */
export function ahoraEnCordoba(now: Date): FechaHoraAr {
  const ar = new Date(now.getTime() + OFFSET_ARG_MS)
  return { fecha: ar.toISOString().slice(0, 10), minutosDelDia: ar.getUTCHours() * 60 + ar.getUTCMinutes() }
}

/** YYYY-MM-DD del día siguiente a `fecha` (aritmética en UTC, sin zona local). */
export function diaSiguiente(fecha: string): string {
  const d = new Date(`${fecha}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

/** ¿Ya es hora de mandar el recordatorio de mañana? (desde las 19:00 hasta fin del día). */
export function esHoraDeRecordatorio(now: Date): boolean {
  return ahoraEnCordoba(now).minutosDelDia >= HORA_RECORDATORIO * 60
}

/**
 * Minutos que faltan para el inicio de un evento (negativo si ya empezó).
 * `hora_inicio` viene de Postgres como 'HH:MM:SS'.
 */
export function minutosHastaInicio(fecha: string, horaInicio: string, now: Date): number {
  const inicioAr = new Date(`${fecha}T${horaInicio.slice(0, 8)}Z`).getTime()
  const ahoraAr = now.getTime() + OFFSET_ARG_MS
  return Math.round((inicioAr - ahoraAr) / 60000)
}

/** Una reserva entra en el aviso si todavía no arrancó y falta menos que la ventana. */
export function reservaPorVencer(fecha: string, horaInicio: string, now: Date): boolean {
  const min = minutosHastaInicio(fecha, horaInicio, now)
  return min > 0 && min <= VENTANA_RESERVA_MIN
}

export type EventoParaAviso = {
  hora_inicio: string
  grua?: { nombre: string } | null
  empresa?: { nombre: string } | null
}

function hhmm(hora: string): string {
  return hora.slice(0, 5)
}

/** Línea corta de un evento: "08:00 Grúa 12 - Empresa Y". */
export function lineaEvento(ev: EventoParaAviso): string {
  const partes = [ev.grua?.nombre, ev.empresa?.nombre].filter(Boolean)
  return partes.length ? `${hhmm(ev.hora_inicio)} ${partes.join(' - ')}` : hhmm(ev.hora_inicio)
}

const MAX_LINEAS_RESUMEN = 4

/** Texto del recordatorio de mañana. Devuelve `null` si no hay servicios. */
export function armarResumenManana(eventos: EventoParaAviso[]): { title: string; body: string } | null {
  if (eventos.length === 0) return null
  const ordenados = [...eventos].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
  const lineas = ordenados.slice(0, MAX_LINEAS_RESUMEN).map(lineaEvento)
  const resto = ordenados.length - lineas.length
  if (resto > 0) lineas.push(`y ${resto} más`)
  const title = ordenados.length === 1 ? 'Mañana: 1 servicio' : `Mañana: ${ordenados.length} servicios`
  return { title, body: lineas.join('\n') }
}

/** Texto del aviso de una reserva próxima a auto-cancelarse. */
export function armarAvisoReserva(ev: EventoParaAviso): { title: string; body: string } {
  return {
    title: 'Reserva sin confirmar',
    body: `${lineaEvento(ev)} se cancela sola al llegar su hora. Confirmala o reprogramala.`,
  }
}
