/**
 * lib/agenda-business.ts — Reglas de negocio de Agenda, sin atarse a Server Actions.
 *
 * Extraído de app/actions/agenda.ts para que tanto los Server Actions (dashboard web,
 * FormData + redirect) como los Route Handlers (app/api/agenda/**, JSON + mobile) llamen
 * exactamente la misma lógica de conflictos de horario / transiciones de estado /
 * validación de operarios — una sola fuente de verdad, no dos copias que se puedan
 * desincronizar. Cada función recibe el cliente Supabase ya autenticado como parámetro
 * (cookie-based desde los Server Actions, Bearer-based desde los Route Handlers).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { friendlyError } from '@/lib/friendly-error'
import { TRANSICIONES_VALIDAS, type EstadoEvento } from '@/lib/validations/agenda'

export type CatalogTable = 'gruas' | 'empresas_agenda' | 'operarios'

const RECURSO_COLUMN: Record<CatalogTable, 'grua_id' | 'empresa_id' | null> = {
  gruas: 'grua_id',
  empresas_agenda: 'empresa_id',
  operarios: null, // vive en eventos_operarios, se resuelve aparte
}

// ─── Operarios ──────────────────────────────────────────────────────────────

/**
 * Un evento sin operarios asignados no se puede ejecutar en la práctica, y un
 * operario inactivo (de baja) no puede quedar asignado a un evento nuevo/editado
 * aunque su ID ya estuviera guardado de antes. Se valida acá (no en el schema Zod)
 * porque requiere ir a la base a chequear `activo`.
 */
export async function validarOperarios(supabase: SupabaseClient, operarioIds: string[]): Promise<string | null> {
  if (operarioIds.length === 0) return 'Asigná al menos un operario al evento.'

  const { data, error } = await supabase.from('operarios').select('id, nombre, activo').in('id', operarioIds)
  if (error) return friendlyError(error)

  const encontrados = new Map((data ?? []).map((o) => [o.id, o]))
  const inactivos: string[] = []
  for (const id of operarioIds) {
    const operario = encontrados.get(id)
    if (!operario) return 'Uno de los operarios seleccionados ya no existe. Volvé a seleccionar los operarios.'
    if (!operario.activo) inactivos.push(operario.nombre)
  }
  if (inactivos.length > 0) {
    return `${inactivos.join(', ')} ${inactivos.length > 1 ? 'están' : 'está'} inactivo/a. Sacalo del evento o reactivalo desde Catálogos.`
  }
  return null
}

/**
 * Simétrico a validarOperarios pero para la grúa: una grúa inactiva (o un ID que ya
 * no existe) no puede quedar asignada a un evento nuevo/editado. Antes solo se
 * validaban los operarios acá — la grúa solo pasaba por el `.uuid()` de Zod, que no
 * chequea que exista ni que esté activa.
 */
export async function validarGrua(supabase: SupabaseClient, gruaId: string): Promise<string | null> {
  const { data, error } = await supabase.from('gruas').select('nombre, activo').eq('id', gruaId).maybeSingle()
  if (error) return friendlyError(error)
  if (!data) return 'La grúa seleccionada ya no existe. Volvé a seleccionar la grúa.'
  if (!data.activo) return `${data.nombre} está inactiva. Reactivala desde Catálogos o elegí otra grúa.`
  return null
}

export async function syncEventoOperarios(
  supabase: SupabaseClient,
  eventoId: string,
  operarioIds: string[],
): Promise<string | null> {
  const { error: delError } = await supabase.from('eventos_operarios').delete().eq('evento_id', eventoId)
  if (delError) return friendlyError(delError)
  if (operarioIds.length === 0) return null
  const { error: insError } = await supabase
    .from('eventos_operarios')
    .insert(operarioIds.map((operario_id) => ({ evento_id: eventoId, operario_id })))
  return insError ? friendlyError(insError) : null
}

// ─── Validación de solapamiento (grúa/operario reservados dos veces) ───────

export type EventoWindow = { fecha: string; fecha_hasta?: string | null; hora_inicio: string; hora_fin?: string | null }

function formatFechaCorta(fecha: string): string {
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

// Bug: antes comparaba fecha y hora por separado ("¿se solapan los rangos de
// fecha?" AND "¿se solapan los horarios de reloj?"), lo cual está mal apenas
// un evento cruza más de un día — un evento de fecha 06/08 08:00 a fecha_hasta
// 10/08 10:00 (una grúa reservada de corrido varios días) no detectaba
// conflicto contra un evento el 07/08 de 14:00 a 16:00, porque 14:00 no es
// "menor" que 10:00 en el reloj, aunque el 07/08 esté completamente adentro
// del rango. Se arma el datetime completo (fecha+hora, como string ISO
// ordena cronológicamente igual) y se comparan como un único intervalo.
export function rangosSeSolapan(a: EventoWindow, b: EventoWindow): boolean {
  const inicioA = `${a.fecha}T${a.hora_inicio}`
  const finA = `${a.fecha_hasta ?? a.fecha}T${a.hora_fin ?? '23:59'}`
  const inicioB = `${b.fecha}T${b.hora_inicio}`
  const finB = `${b.fecha_hasta ?? b.fecha}T${b.hora_fin ?? '23:59'}`
  return inicioA < finB && inicioB < finA
}

/**
 * Busca choques de horario para la grúa y cada operario del evento nuevo/editado
 * contra eventos ya cargados (mismo criterio: mismo recurso + rango de fecha+hora
 * solapado). No corre en SQL (el solapamiento de rangos con NULLs es incómodo de
 * expresar en un filtro de Supabase JS) — trae los eventos candidatos (ya
 * acotados por grúa/operario) y compara en memoria, dataset chico para este caso de uso.
 */
export async function buscarConflicto(
  supabase: SupabaseClient,
  ventana: EventoWindow,
  gruaId: string,
  operarioIds: string[],
  excludeId?: string,
): Promise<string | null> {
  let gruaQuery = supabase
    .from('eventos_agenda')
    .select('id, fecha, fecha_hasta, hora_inicio, hora_fin')
    .eq('grua_id', gruaId)
    .neq('estado', 'cancelado')
  if (excludeId) gruaQuery = gruaQuery.neq('id', excludeId)
  const { data: eventosGrua, error: errorGrua } = await gruaQuery
  if (errorGrua) throw new Error(`No se pudo verificar disponibilidad de la grúa: ${friendlyError(errorGrua)}`)
  for (const ev of eventosGrua ?? []) {
    if (rangosSeSolapan(ventana, ev)) {
      return `La grúa seleccionada ya está asignada el ${formatFechaCorta(ev.fecha)} de ${ev.hora_inicio.slice(0, 5)} a ${ev.hora_fin ? ev.hora_fin.slice(0, 5) : 'sin definir'}.`
    }
  }

  if (operarioIds.length > 0) {
    const { data: filasOperarios, error: errorOperarios } = await supabase
      .from('eventos_operarios')
      .select('evento_id, operario:operarios(nombre), evento:eventos_agenda(id, fecha, fecha_hasta, hora_inicio, hora_fin, estado)')
      .in('operario_id', operarioIds)
    if (errorOperarios) throw new Error(`No se pudo verificar disponibilidad de los operarios: ${friendlyError(errorOperarios)}`)
    for (const fila of filasOperarios ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ev = fila.evento as any
      if (!ev || ev.estado === 'cancelado') continue
      if (excludeId && ev.id === excludeId) continue
      if (rangosSeSolapan(ventana, ev)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nombreOperario = (fila.operario as any)?.nombre ?? 'Un operario'
        return `${nombreOperario} ya está asignado el ${formatFechaCorta(ev.fecha)} de ${ev.hora_inicio.slice(0, 5)} a ${ev.hora_fin ? ev.hora_fin.slice(0, 5) : 'sin definir'}.`
      }
    }
  }

  return null
}

/**
 * Devuelve los IDs de grúas/operarios ya ocupados (choque de horario) en la
 * ventana dada — usado para marcar como "ocupado" las opciones en el form de
 * creación/edición de eventos. `excludeEventoId` se pasa al editar, para que
 * el propio evento no se marque a sí mismo como conflicto.
 */
export async function getRecursosOcupados(
  supabase: SupabaseClient,
  fecha: string,
  fechaHasta: string | null,
  horaInicio: string,
  horaFin: string | null,
  excludeEventoId?: string,
): Promise<{ gruaIds: string[]; operarioIds: string[] }> {
  try {
    const ventana: EventoWindow = { fecha, fecha_hasta: fechaHasta, hora_inicio: horaInicio, hora_fin: horaFin }

    let query = supabase
      .from('eventos_agenda')
      .select('id, fecha, fecha_hasta, hora_inicio, hora_fin, grua_id, eventos_operarios(operario_id)')
      .neq('estado', 'cancelado')
    if (excludeEventoId) query = query.neq('id', excludeEventoId)
    const { data, error } = await query
    if (error || !data) return { gruaIds: [], operarioIds: [] }

    const gruaIds = new Set<string>()
    const operarioIds = new Set<string>()
    for (const ev of data) {
      if (!rangosSeSolapan(ventana, ev)) continue
      if (ev.grua_id) gruaIds.add(ev.grua_id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const rel of (ev.eventos_operarios as any[]) ?? []) {
        if (rel?.operario_id) operarioIds.add(rel.operario_id)
      }
    }
    return { gruaIds: [...gruaIds], operarioIds: [...operarioIds] }
  } catch {
    return { gruaIds: [], operarioIds: [] }
  }
}

// ─── Restricciones de estado de eventos ────────────────────────────────────

const CAMPOS_COMPARABLES = [
  'fecha', 'fecha_hasta', 'hora_inicio', 'hora_fin',
  'grua_id', 'empresa_id', 'ubicacion', 'notas',
] as const

// Postgres devuelve las columnas TIME con segundos ("14:30:00"); el <input type="time">
// del form solo manda minutos ("14:30") — normalizar antes de comparar o cualquier
// guardado (aunque no se toque la hora) se vería como "cambió algo más que el estado".
function normalizaCampo(campo: (typeof CAMPOS_COMPARABLES)[number], valor: unknown): string | null {
  if (valor === null || valor === undefined || valor === '') return null
  const str = String(valor)
  return campo === 'hora_inicio' || campo === 'hora_fin' ? str.slice(0, 5) : str
}

/**
 * Valida que la transición de estado sea válida y que, si el evento está
 * 'en_curso', solo se esté cambiando el estado (nada más). Devuelve un
 * mensaje de error o null si la actualización puede seguir.
 */
export async function validarEdicionEvento(
  supabase: SupabaseClient,
  id: string,
  nuevo: { estado: EstadoEvento; [key: string]: unknown },
): Promise<string | null> {
  const { data: actual, error } = await supabase
    .from('eventos_agenda')
    .select('estado, fecha, fecha_hasta, hora_inicio, hora_fin, grua_id, empresa_id, ubicacion, notas')
    .eq('id', id)
    .single()
  if (error || !actual) return 'No se encontró el evento.'

  const estadoActual = actual.estado as EstadoEvento

  if (estadoActual === 'finalizado' || estadoActual === 'cancelado') {
    return `Un evento ${estadoActual} no puede editarse.`
  }

  if (estadoActual !== nuevo.estado && !TRANSICIONES_VALIDAS[estadoActual].includes(nuevo.estado)) {
    return `No se puede pasar de '${estadoActual}' a '${nuevo.estado}'.`
  }

  if (estadoActual === 'en_curso') {
    const cambioAlgoMasQueEstado = CAMPOS_COMPARABLES.some(
      (campo) => normalizaCampo(campo, actual[campo]) !== normalizaCampo(campo, nuevo[campo]),
    )
    if (cambioAlgoMasQueEstado) {
      return 'Un evento en curso solo permite cambiar el estado.'
    }
  }

  return null
}

/**
 * Antes DELETE no tenía ninguna restricción: se podía borrar cualquier
 * evento en cualquier estado, sin pasar por acá. Un evento en_curso borrado
 * hace desaparecer un trabajo activo sin dejar rastro, y uno finalizado es
 * historial (probablemente ya facturado) — bloqueamos esos dos, igual que ya
 * se bloquea editarlos en validarEdicionEvento.
 */
export async function validarBorradoEvento(supabase: SupabaseClient, id: string): Promise<string | null> {
  const { data, error } = await supabase.from('eventos_agenda').select('estado').eq('id', id).maybeSingle()
  if (error) return friendlyError(error)
  if (!data) return null // ya no existe — dejar que el delete sea no-op
  if (data.estado === 'en_curso') return 'No se puede borrar: el evento está en curso.'
  if (data.estado === 'finalizado') return 'No se puede borrar un evento finalizado (es historial).'
  return null
}

// ─── Auto-transición de estado por hora ────────────────────────────────────

export type EventoEstadoWindow = {
  estado: string
  fecha: string
  fecha_hasta: string | null
  hora_inicio: string
  hora_fin: string | null
}

/**
 * Estado que un evento debería tener AHORA según fecha/hora, o `null` si el
 * guardado sigue siendo correcto. Se aplica al LEER (lib/agenda.ts), nunca en el
 * PATCH manual — así una reserva vencida sin confirmar no "avanza sola" a
 * programado/en_curso (se cancela), y un programado que ya arrancó no se queda
 * mostrando datos de una hora que ya pasó. `en_curso` no se toca acá: cerrarlo
 * (finalizado/cancelado) es una decisión humana, no algo que deba pasar solo.
 */
export function estadoTransicionado(evento: EventoEstadoWindow, now = new Date()): EstadoEvento | null {
  if (evento.estado !== 'reserva' && evento.estado !== 'programado') return null
  const inicio = new Date(`${evento.fecha}T${evento.hora_inicio.slice(0, 8)}`)
  const fin = new Date(`${evento.fecha_hasta ?? evento.fecha}T${(evento.hora_fin ?? '23:59:59').slice(0, 8)}`)
  if (evento.estado === 'reserva') return fin < now ? 'cancelado' : null
  if (fin < now) return 'finalizado'
  if (inicio <= now) return 'en_curso'
  return null
}

// ─── Catálogos (gruas / empresas_agenda / operarios) ───────────────────────

export async function estadosDeEventosDelRecurso(
  supabase: SupabaseClient,
  table: CatalogTable,
  id: string,
): Promise<string[]> {
  if (table === 'operarios') {
    const { data } = await supabase
      .from('eventos_operarios')
      .select('evento:eventos_agenda(estado)')
      .eq('operario_id', id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((fila: any) => fila.evento?.estado).filter(Boolean)
  }
  const columna = RECURSO_COLUMN[table]
  if (!columna) return []
  const { data } = await supabase.from('eventos_agenda').select('estado').eq(columna, id)
  return (data ?? []).map((ev) => ev.estado)
}

/**
 * Alterna activo/inactivo de un recurso de catálogo. `activo` es el valor ACTUAL
 * (se pasa lo que se está por invertir) — si se está inactivando y participa de
 * un evento en_curso O programado, bloquea (409). Requisito: un recurso ya
 * asignado a algo, en curso o a futuro, no se puede dar de baja.
 */
export async function catalogToggle(
  supabase: SupabaseClient,
  table: CatalogTable,
  id: string,
  activo: boolean,
): Promise<{ error?: string }> {
  if (activo) {
    // Se está por INACTIVAR — chequear que no participe de un evento activo.
    const estados = await estadosDeEventosDelRecurso(supabase, table, id)
    if (estados.includes('en_curso')) {
      return { error: 'No se puede inactivar: está participando en un evento en curso.' }
    }
    const programados = estados.filter((e) => e === 'programado' || e === 'reserva').length
    if (programados > 0) {
      return { error: `No se puede inactivar: tiene ${programados} evento(s) programado(s) o reservado(s) asignado(s).` }
    }
  }

  const { error } = await supabase.from(table).update({ activo: !activo }).eq('id', id)
  if (error) return { error: friendlyError(error) }
  return {}
}

/**
 * A diferencia de catalogToggle (que ya bloqueaba inactivar un recurso con eventos
 * activos), el delete no chequeaba nada — como grua_id/empresa_id/operario_id son
 * FK ON DELETE RESTRICT, borrar cualquier recurso alguna vez usado en un evento
 * (incluso uno finalizado/cancelado viejo, que es historial) siempre fallaba, pero
 * como un 500 de Postgres genérico en vez de un 409 con un mensaje claro. Se
 * bloquea acá con el mismo criterio y mensaje que ya usa catalogToggle.
 */
export async function catalogDelete(
  supabase: SupabaseClient,
  table: CatalogTable,
  id: string,
): Promise<{ error?: string }> {
  const estados = await estadosDeEventosDelRecurso(supabase, table, id)
  if (estados.length > 0) {
    return { error: `No se puede eliminar: tiene ${estados.length} evento(s) asociado(s). Desactivalo en vez de eliminarlo.` }
  }

  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) return { error: friendlyError(error) }
  return {}
}

export async function gruaDuplicada(
  supabase: SupabaseClient,
  nombre: string,
  patente: string,
  excludeId?: string,
): Promise<string | null> {
  let porPatente = supabase.from('gruas').select('id').ilike('patente', patente)
  let porNombre = supabase.from('gruas').select('id').ilike('nombre', nombre)
  if (excludeId) {
    porPatente = porPatente.neq('id', excludeId)
    porNombre = porNombre.neq('id', excludeId)
  }
  const [{ data: byPatente }, { data: byNombre }] = await Promise.all([porPatente.limit(1), porNombre.limit(1)])
  if (byPatente && byPatente.length > 0) return 'Ya existe una grúa con esa patente.'
  if (byNombre && byNombre.length > 0) return 'Ya existe una grúa con ese nombre.'
  return null
}

export async function empresaAgendaDuplicada(
  supabase: SupabaseClient,
  nombre: string,
  excludeId?: string,
): Promise<string | null> {
  let query = supabase.from('empresas_agenda').select('id').ilike('nombre', nombre)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query.limit(1)
  if (data && data.length > 0) return 'Ya existe una empresa con ese nombre.'
  return null
}

export async function operarioDuplicado(
  supabase: SupabaseClient,
  nombre: string,
  excludeId?: string,
): Promise<string | null> {
  let query = supabase.from('operarios').select('id').ilike('nombre', nombre)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query.limit(1)
  if (data && data.length > 0) return 'Ya existe un operario con ese nombre.'
  return null
}
