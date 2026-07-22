'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { friendlyError } from '@/lib/friendly-error'
import {
  eventoAgendaSchema,
  gruaSchema,
  empresaAgendaSchema,
  operarioSchema,
  TRANSICIONES_VALIDAS,
  type EstadoEvento,
} from '@/lib/validations/agenda'

export type AgendaState = { success?: boolean; error?: string; warning?: string } | undefined

type CatalogTable = 'gruas' | 'empresas_agenda' | 'operarios'
type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>

const RECURSO_COLUMN: Record<CatalogTable, 'grua_id' | 'empresa_id' | null> = {
  gruas: 'grua_id',
  empresas_agenda: 'empresa_id',
  operarios: null, // vive en eventos_operarios, se resuelve aparte
}

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

function revalidateEventos() {
  revalidatePath('/dashboard/agenda')
  revalidatePath('/agenda-tv')
}

function revalidateCatalogos() {
  revalidatePath('/dashboard/agenda/catalogos')
  revalidatePath('/dashboard/agenda/nuevo')
  revalidatePath('/dashboard/agenda')
}

function parseOperarioIds(raw: FormDataEntryValue | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(String(raw))
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

/**
 * Un evento sin operarios asignados no se puede ejecutar en la práctica, y un
 * operario inactivo (de baja) no puede quedar asignado a un evento nuevo/editado
 * aunque su ID ya estuviera guardado de antes. Se valida acá (no en el schema Zod)
 * porque requiere ir a la base a chequear `activo`.
 */
async function validarOperarios(supabase: SupabaseServer, operarioIds: string[]): Promise<string | null> {
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

async function syncEventoOperarios(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
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

function parseEventoForm(formData: FormData) {
  return eventoAgendaSchema.safeParse({
    fecha:       formData.get('fecha'),
    fecha_hasta: formData.get('fecha_hasta'),
    hora_inicio: formData.get('hora_inicio'),
    hora_fin:    formData.get('hora_fin'),
    grua_id:     formData.get('grua_id'),
    empresa_id:  formData.get('empresa_id'),
    ubicacion:   formData.get('ubicacion'),
    notas:       formData.get('notas'),
    estado:      formData.get('estado'),
  })
}

// ─── Validación de solapamiento (grúa/operario reservados dos veces) ──────────

type EventoWindow = { fecha: string; fecha_hasta?: string | null; hora_inicio: string; hora_fin?: string | null }

function formatFechaCorta(fecha: string): string {
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

function rangosSeSolapan(a: EventoWindow, b: EventoWindow): boolean {
  const finA = a.fecha_hasta ?? a.fecha
  const finB = b.fecha_hasta ?? b.fecha
  if (a.fecha > finB || b.fecha > finA) return false
  const horaFinA = a.hora_fin ?? '23:59'
  const horaFinB = b.hora_fin ?? '23:59'
  return a.hora_inicio < horaFinB && b.hora_inicio < horaFinA
}

/**
 * Busca choques de horario para la grúa y cada operario del evento nuevo/editado
 * contra eventos ya cargados (mismo criterio: mismo recurso + rango de fecha+hora
 * solapado). No corre en SQL (el solapamiento de rangos con NULLs es incómodo de
 * expresar en un filtro de Supabase JS) — trae los eventos candidatos (ya
 * acotados por grúa/operario) y compara en memoria, dataset chico para este caso de uso.
 */
async function buscarConflicto(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
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
  fecha: string,
  fechaHasta: string | null,
  horaInicio: string,
  horaFin: string | null,
  excludeEventoId?: string,
): Promise<{ gruaIds: string[]; operarioIds: string[] }> {
  try {
    const supabase = await requireUser()
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

// ─── Restricciones de estado de eventos ─────────────────────────────────────

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
async function validarEdicionEvento(
  supabase: SupabaseServer,
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

// ─── Eventos ────────────────────────────────────────────────────────────────

export async function createEvento(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = parseEventoForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

    const { hora_fin, ...rest } = parsed.data
    const operarioIds = parseOperarioIds(formData.get('operario_ids'))

    const errorOperarios = await validarOperarios(supabase, operarioIds)
    if (errorOperarios) return { error: errorOperarios }

    const conflicto = await buscarConflicto(supabase, parsed.data, rest.grua_id, operarioIds)
    if (conflicto) return { error: conflicto }

    const { data, error } = await supabase
      .from('eventos_agenda')
      .insert({ ...rest, hora_fin: hora_fin || null })
      .select('id')
      .single()

    if (error || !data) return { error: error ? friendlyError(error) : 'No se pudo crear el evento.' }

    const syncError = await syncEventoOperarios(supabase, data.id, operarioIds)
    if (syncError) return { error: syncError }

    revalidateEventos()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect('/dashboard/agenda?saved=created')
}

export async function updateEvento(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de evento requerido.' }

    const parsed = parseEventoForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

    const { hora_fin, ...rest } = parsed.data

    const errorEdicion = await validarEdicionEvento(supabase, id, { ...rest, hora_fin: hora_fin || null })
    if (errorEdicion) return { error: errorEdicion }

    const operarioIds = parseOperarioIds(formData.get('operario_ids'))

    const errorOperarios = await validarOperarios(supabase, operarioIds)
    if (errorOperarios) return { error: errorOperarios }

    const conflicto = await buscarConflicto(supabase, parsed.data, rest.grua_id, operarioIds, id)
    if (conflicto) return { error: conflicto }

    const { error } = await supabase
      .from('eventos_agenda')
      .update({ ...rest, hora_fin: hora_fin || null, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: friendlyError(error) }

    const syncError = await syncEventoOperarios(supabase, id, operarioIds)
    if (syncError) return { error: syncError }

    revalidateEventos()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect('/dashboard/agenda?saved=updated')
}

export async function deleteEvento(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de evento requerido.' }

    const { error } = await supabase.from('eventos_agenda').delete().eq('id', id)
    if (error) return { error: friendlyError(error) }

    revalidateEventos()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirect('/dashboard/agenda?saved=deleted')
}

// ─── Catálogos (gruas / empresas_agenda / operarios) ───────────────────────
// Listas simples: alta + activo/inactivo + borrado. Sin edición de campos
// individuales — YAGNI hasta que el cliente pida más (ver plan de Agenda).

async function estadosDeEventosDelRecurso(
  supabase: SupabaseServer,
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

async function catalogToggle(table: CatalogTable, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    const activo = formData.get('activo') === 'true'

    let warning: string | undefined
    if (activo) {
      // Se está por INACTIVAR — chequear que no participe de un evento en curso.
      const estados = await estadosDeEventosDelRecurso(supabase, table, id)
      if (estados.includes('en_curso')) {
        return { error: 'No se puede inactivar: está participando en un evento en curso.' }
      }
      const programados = estados.filter((e) => e === 'programado').length
      if (programados > 0) {
        warning = `Atención: tiene ${programados} evento(s) programado(s) que todavía lo/la usan.`
      }
    }

    const { error } = await supabase.from(table).update({ activo: !activo }).eq('id', id)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true, warning }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}

async function catalogDelete(table: CatalogTable, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}

function parseGruaForm(formData: FormData) {
  return gruaSchema.safeParse({
    nombre:              formData.get('nombre'),
    patente:             formData.get('patente'),
    capacidad_toneladas: formData.get('capacidad_toneladas') || undefined,
    tipo:                formData.get('tipo') || undefined,
  })
}

async function gruaDuplicada(
  supabase: SupabaseServer,
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

export async function createGrua(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = parseGruaForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const duplicado = await gruaDuplicada(supabase, parsed.data.nombre, parsed.data.patente)
    if (duplicado) return { error: duplicado }
    const { error } = await supabase.from('gruas').insert(parsed.data)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
export async function updateGrua(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de grúa requerido.' }
    const parsed = parseGruaForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const duplicado = await gruaDuplicada(supabase, parsed.data.nombre, parsed.data.patente, id)
    if (duplicado) return { error: duplicado }
    const { error } = await supabase.from('gruas').update(parsed.data).eq('id', id)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
export async function toggleGrua(prevState: unknown, formData: FormData) {
  return catalogToggle('gruas', formData)
}
export async function deleteGrua(prevState: unknown, formData: FormData) {
  return catalogDelete('gruas', formData)
}

export async function createEmpresaAgenda(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = empresaAgendaSchema.safeParse({
      nombre:   formData.get('nombre'),
      contacto: formData.get('contacto'),
      telefono: formData.get('telefono'),
      notas:    formData.get('notas'),
    })
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const { data: existente } = await supabase.from('empresas_agenda').select('id').ilike('nombre', parsed.data.nombre).limit(1)
    if (existente && existente.length > 0) return { error: 'Ya existe una empresa con ese nombre.' }
    const { error } = await supabase.from('empresas_agenda').insert(parsed.data)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
export async function toggleEmpresaAgenda(prevState: unknown, formData: FormData) {
  return catalogToggle('empresas_agenda', formData)
}
export async function deleteEmpresaAgenda(prevState: unknown, formData: FormData) {
  return catalogDelete('empresas_agenda', formData)
}

export async function createOperario(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = operarioSchema.safeParse({
      nombre:   formData.get('nombre'),
      telefono: formData.get('telefono'),
    })
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const { error } = await supabase.from('operarios').insert(parsed.data)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
export async function toggleOperario(prevState: unknown, formData: FormData) {
  return catalogToggle('operarios', formData)
}
export async function deleteOperario(prevState: unknown, formData: FormData) {
  return catalogDelete('operarios', formData)
}
