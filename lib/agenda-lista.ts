import { addDays, toDateInput } from './agenda-view'

/** Rangos ofrecidos en la lista del panel (días hacia adelante desde hoy). */
export const RANGOS_DIAS = [7, 14, 30, 60] as const
export const RANGO_DIAS_DEFECTO = 14

export type FiltrosLista = { estado?: string; gruaId?: string; empresaId?: string; q?: string }

type EventoLista = {
  fecha: string
  fecha_hasta?: string | null
  hora_inicio: string
  estado: string
  empresa_id?: string | null
  ubicacion?: string | null
  empresa?: { nombre: string } | null
  gruas?: { id: string; nombre: string }[]
}

const sinAcentos = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function rangoDias(valor: string | undefined): number {
  const n = Number(valor)
  return (RANGOS_DIAS as readonly number[]).includes(n) ? n : RANGO_DIAS_DEFECTO
}

/** Última fecha (YYYY-MM-DD) del rango: hoy + `dias`. Se calcula sobre fechas de pared, sin zona horaria. */
export function hastaDelRango(hoy: string, dias: number): string {
  return toDateInput(addDays(new Date(`${hoy}T00:00:00`), dias))
}

export function filtrarEventos<T extends EventoLista>(eventos: T[], f: FiltrosLista): T[] {
  const q = f.q ? sinAcentos(f.q.trim()) : ''
  return eventos.filter((ev) => {
    if (f.estado && ev.estado !== f.estado) return false
    if (f.empresaId && ev.empresa_id !== f.empresaId) return false
    if (f.gruaId && !(ev.gruas ?? []).some((g) => g.id === f.gruaId)) return false
    if (q) {
      const texto = sinAcentos([ev.empresa?.nombre, ev.ubicacion, ...(ev.gruas ?? []).map((g) => g.nombre)].filter(Boolean).join(' '))
      if (!texto.includes(q)) return false
    }
    return true
  })
}

/**
 * Agrupa por día en que se muestra el evento: su `fecha`, o `desde` si arrancó antes y sigue en curso
 * (reservas de varios días). Dentro de cada día ordena por hora de inicio. Devuelve los días en orden.
 */
export function agruparPorDia<T extends EventoLista>(eventos: T[], desde: string): { fecha: string; eventos: T[] }[] {
  const dias = new Map<string, T[]>()
  for (const ev of eventos) {
    const dia = ev.fecha < desde ? desde : ev.fecha
    dias.set(dia, [...(dias.get(dia) ?? []), ev])
  }
  return [...dias.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, evs]) => ({ fecha, eventos: evs.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)) }))
}

/** "Hoy · lun 26 oct", "Mañana · mar 27 oct" o "mié 28 oct". */
export function etiquetaDia(fecha: string, hoy: string): string {
  const base = new Date(`${fecha}T12:00:00Z`).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).replace(/\./g, '')
  if (fecha === hoy) return `Hoy · ${base}`
  if (fecha === hastaDelRango(hoy, 1)) return `Mañana · ${base}`
  return base
}
