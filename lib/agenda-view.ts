/**
 * Helpers puros para las vistas de solo lectura de Agenda (semanal + mensual TV).
 * Sin acceso a datos — eso vive en lib/agenda.ts.
 */

import type { EventoAgenda } from './agenda'

// Fecha local en formato YYYY-MM-DD. OJO: d.toISOString() pasa a UTC — con
// Argentina en UTC-3 eso corre la fecha "hoy" un día para adelante entre las
// 21:00 y las 23:59 locales (el reloj UTC ya cruzó medianoche). Por eso se arma
// con los componentes locales de `d`, nunca con toISOString().
export function toDateInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

/** Lunes de la semana (Lun-Dom) que contiene `d`. */
export function getWeekStart(d: Date): Date {
  const day = d.getDay() // 0=Dom..6=Sáb
  const diff = day === 0 ? -6 : 1 - day
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff)
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

/** Matriz de semanas (Lun-Dom) que cubre el mes de `d`, con días de meses vecinos para completar la grilla. */
export function getMonthMatrix(d: Date): Date[][] {
  const start = getWeekStart(new Date(d.getFullYear(), d.getMonth(), 1))
  const end = getWeekStart(new Date(d.getFullYear(), d.getMonth() + 1, 0))
  const weeks: Date[][] = []
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 7)) {
    weeks.push(getWeekDays(cursor))
  }
  return weeks
}

const ESTADO_COLORS: Record<string, string> = {
  reserva: 'bg-igb-navy/20 border-igb-navy/40 text-blue-200',
  programado: 'bg-igb-yellow/20 border-igb-yellow/40 text-igb-yellow',
  en_curso: 'bg-blue-500/20 border-blue-400/40 text-blue-300',
  finalizado: 'bg-white/5 border-white/10 text-slate-400',
  cancelado: 'bg-red-500/10 border-red-400/30 text-red-300 line-through',
}

export function estadoColorClasses(estado: string): string {
  return ESTADO_COLORS[estado] ?? ESTADO_COLORS.programado
}

/** Paleta clara (fondo blanco) — usada por la vista semanal de jefes, no por la TV. */
const ESTADO_COLORS_LIGHT: Record<string, string> = {
  // navy a /10 quedaba demasiado apagado al lado del amarillo (mismo % de
  // opacidad, pero navy es un tono mucho más oscuro/desaturado de base, así
  // que a simple vista casi no se distinguía del blanco de fondo).
  reserva: 'bg-igb-navy/20 border-igb-navy/40 text-igb-navy',
  programado: 'bg-igb-yellow/15 border-igb-yellow/30 text-igb-yellow-dark',
  en_curso: 'bg-blue-50 border-blue-200 text-blue-600',
  finalizado: 'bg-zinc-100 border-zinc-200 text-zinc-500',
  cancelado: 'bg-red-50 border-red-200 text-red-500 line-through',
}

export function estadoColorClassesLight(estado: string): string {
  return ESTADO_COLORS_LIGHT[estado] ?? ESTADO_COLORS_LIGHT.programado
}

/** Color sólido para un punto/franja — mismo mapeo que ESTADO_COLORS_LIGHT (usado por la leyenda de la TV). */
const ESTADO_STRIP: Record<string, string> = {
  reserva: 'bg-igb-navy',
  programado: 'bg-igb-yellow',
  en_curso: 'bg-blue-500',
  finalizado: 'bg-zinc-300',
  cancelado: 'bg-red-400',
}

export function estadoStripColor(estado: string): string {
  return ESTADO_STRIP[estado] ?? ESTADO_STRIP.programado
}

/** "en_curso" -> "En curso", "programado" -> "Programado". */
export function formatEstado(estado: string): string {
  return estado.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

/**
 * Estado *visual* según la hora actual, sin tocar la DB — red de seguridad para la
 * ventana entre un fetch y el siguiente (el server ya persiste lo mismo al leer, ver
 * `estadoTransicionado` en lib/agenda-business.ts, una sola fuente de reglas repetida
 * acá solo porque el fetch pudo haber pasado hace rato).
 *  - `reserva` nunca confirmada cuyo día/hora ya llegó -> `cancelado` (no avanza sola a
 *    `programado`/`en_curso`; se cancela ni bien arranca su ventana, no espera a que
 *    termine, para liberar la grúa/operario apenas se sabe que no se confirmó).
 *  - `programado` que ya arrancó pero no terminó -> `en_curso` (nunca `reserva`).
 *  - `programado` o `en_curso` cuya ventana ya terminó -> `finalizado`.
 *
 * Bug 1 (ya resuelto acá): usaba `evento.fecha` (día de inicio) para calcular el fin. Un
 * evento de varios días (fecha_hasta > fecha) se pintaba "finalizado" ya pasada la hora
 * de fin del PRIMER día, aunque siguiera en curso el resto — se usa fecha_hasta.
 * Bug 2 (ya resuelto acá): sin hora_fin, usaba hora_inicio como si durara 0 minutos (se
 * veía "finalizado"/"en_curso" mal apenas empezaba). rangosSeSolapan sí interpreta
 * hora_fin null como "abierto hasta fin del día" — se unifica ese criterio acá también.
 */
export function getEstadoVisual(evento: EventoAgenda, now = new Date()): string {
  const fechaFin = evento.fecha_hasta ?? evento.fecha
  const inicio = new Date(`${evento.fecha}T${evento.hora_inicio.slice(0, 8)}`)
  const fin = new Date(`${fechaFin}T${(evento.hora_fin ?? '23:59:59').slice(0, 8)}`)
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

export interface DayLayoutSlot {
  lane: number
  lanes: number
}

/**
 * Carriles side-by-side para eventos de un mismo día que se solapan en horario
 * (antes se apilaban todos ocupando el ancho completo de la columna, ilegibles).
 * Algoritmo clásico de "meeting rooms": agrupa en clusters conexos por
 * solapamiento y, dentro de cada cluster, asigna cada evento al primer carril
 * ya libre (greedy, ordenado por hora de inicio).
 */
export function layoutDayEvents<T extends { hora_inicio: string; hora_fin?: string | null }>(
  eventos: T[],
): Map<T, DayLayoutSlot> {
  const layout = new Map<T, DayLayoutSlot>()
  const sorted = [...eventos].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))

  let cluster: T[] = []
  let clusterEnd = ''

  function flushCluster() {
    if (cluster.length === 0) return
    const laneEnds: string[] = []
    const laneOf = new Map<T, number>()
    for (const ev of cluster) {
      const fin = ev.hora_fin ?? '23:59:59'
      let lane = laneEnds.findIndex((end) => end <= ev.hora_inicio)
      if (lane === -1) {
        lane = laneEnds.length
        laneEnds.push(fin)
      } else {
        laneEnds[lane] = fin
      }
      laneOf.set(ev, lane)
    }
    const lanes = laneEnds.length
    for (const ev of cluster) layout.set(ev, { lane: laneOf.get(ev)!, lanes })
    cluster = []
    clusterEnd = ''
  }

  for (const ev of sorted) {
    const fin = ev.hora_fin ?? '23:59:59'
    if (cluster.length > 0 && ev.hora_inicio >= clusterEnd) flushCluster()
    cluster.push(ev)
    clusterEnd = cluster.length === 1 ? fin : fin > clusterEnd ? fin : clusterEnd
  }
  flushCluster()

  return layout
}
