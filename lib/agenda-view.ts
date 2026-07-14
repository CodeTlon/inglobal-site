/**
 * Helpers puros para las vistas de solo lectura de Agenda (semanal + mensual TV).
 * Sin acceso a datos — eso vive en lib/agenda.ts.
 */

import type { EventoAgenda } from './agenda'

export function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10)
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
  programado: 'bg-igb-yellow/15 border-igb-yellow/30 text-igb-yellow-dark',
  en_curso: 'bg-blue-50 border-blue-200 text-blue-600',
  finalizado: 'bg-zinc-100 border-zinc-200 text-zinc-500',
  cancelado: 'bg-red-50 border-red-200 text-red-500 line-through',
}

export function estadoColorClassesLight(estado: string): string {
  return ESTADO_COLORS_LIGHT[estado] ?? ESTADO_COLORS_LIGHT.programado
}

/** "en_curso" -> "En curso", "programado" -> "Programado". */
export function formatEstado(estado: string): string {
  return estado.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

/**
 * Estado *visual*: un evento "programado" cuya hora de fin (o inicio, si no cargó fin) ya
 * pasó se muestra como "finalizado" sin tocar la DB — el campo real sigue siendo manual
 * (EventoForm), esto solo afecta cómo se pinta en las vistas de solo lectura.
 */
export function getEstadoVisual(evento: EventoAgenda, now = new Date()): string {
  if (evento.estado === 'programado') {
    const fin = new Date(`${evento.fecha}T${(evento.hora_fin ?? evento.hora_inicio).slice(0, 8)}`)
    if (fin < now) return 'finalizado'
  }
  return evento.estado
}
