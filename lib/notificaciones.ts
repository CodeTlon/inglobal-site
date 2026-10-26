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
  /** Varias grúas por servicio (migración 0004); si viene, manda sobre `grua`. */
  eventos_gruas?: { orden: number; grua: { nombre: string } | null }[] | null
  empresa?: { nombre: string } | null
}

function hhmm(hora: string): string {
  return hora.slice(0, 5)
}

function recortar(texto: string, max: number): string {
  return texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto
}

/** "Grúa 12" o "Grúa 12 +2" cuando el servicio lleva varias (la primera por `orden`). */
function resumenGruas(ev: EventoParaAviso): string | null {
  const ordenadas = [...(ev.eventos_gruas ?? [])]
    .sort((a, b) => a.orden - b.orden)
    .map((g) => g.grua?.nombre)
    .filter((n): n is string => Boolean(n))
  if (ordenadas.length === 0) return ev.grua?.nombre ?? null
  return ordenadas.length > 1 ? `${ordenadas[0]} +${ordenadas.length - 1}` : ordenadas[0]
}

/** Línea corta de un evento, empresa primero y grúa después: "08:00 Empresa Y · Grúa 12 +2". */
export function lineaEvento(ev: EventoParaAviso): string {
  const partes = [ev.empresa?.nombre ? recortar(ev.empresa.nombre, 24) : null, resumenGruas(ev)].filter(Boolean)
  return partes.length ? `${hhmm(ev.hora_inicio)} ${partes.join(' · ')}` : hhmm(ev.hora_inicio)
}

/** Hasta cuántos servicios se listan completos; con más, se listan `MAX_LINEAS_RESUMEN` y el resto se resume. */
const MAX_SERVICIOS_COMPLETOS = 4
const MAX_LINEAS_RESUMEN = 3

/**
 * Texto del recordatorio de mañana. Devuelve `null` si no hay servicios.
 * Con pocos servicios los lista todos; con muchos lista los primeros y cierra con
 * "y N más (último: HH:MM)" para que entre en el aviso (iOS muestra unas 4 líneas en pantalla bloqueada).
 */
export function armarResumenManana(eventos: EventoParaAviso[]): { title: string; body: string } | null {
  if (eventos.length === 0) return null
  const ordenados = [...eventos].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
  const primero = hhmm(ordenados[0].hora_inicio)
  const completo = ordenados.length <= MAX_SERVICIOS_COMPLETOS
  const visibles = completo ? ordenados : ordenados.slice(0, MAX_LINEAS_RESUMEN)
  const lineas = visibles.map(lineaEvento)
  if (!completo) {
    const resto = ordenados.length - visibles.length
    lineas.push(`y ${resto} más (último: ${hhmm(ordenados[ordenados.length - 1].hora_inicio)})`)
  }
  const title =
    ordenados.length === 1 ? `Mañana: 1 servicio a las ${primero}` : `Mañana: ${ordenados.length} servicios, desde las ${primero}`
  return { title, body: lineas.join('\n') }
}

/** Texto del aviso de una reserva próxima a auto-cancelarse. */
export function armarAvisoReserva(ev: EventoParaAviso): { title: string; body: string } {
  return {
    title: 'Reserva sin confirmar',
    body: `${lineaEvento(ev)}\nSe cancela sola a las ${hhmm(ev.hora_inicio)}. Confirmala o reprogramala.`,
  }
}
