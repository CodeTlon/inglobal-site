'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSessionUser, getServerDb } from '@/lib/session'
import { getEventoAgendaById } from '@/lib/agenda'
import { friendlyError } from '@/lib/friendly-error'
import {
  eventoAgendaSchema,
  crearEventoSchema,
  gruaSchema,
  empresaAgendaSchema,
  operarioSchema,
  ESTADOS_EVENTO,
  type EstadoEvento,
} from '@/lib/validations/agenda'
import {
  type CatalogTable,
  validarGrua,
  validarOperarios,
  syncEventoOperarios,
  buscarConflicto,
  getRecursosOcupados as getRecursosOcupadosBusiness,
  validarEdicionEvento,
  validarBorradoEvento,
  catalogToggle as catalogToggleBusiness,
  catalogDelete as catalogDeleteBusiness,
  gruaDuplicada,
  empresaAgendaDuplicada,
  operarioDuplicado,
  reincorporarOperario as reincorporarOperarioBusiness,
  eliminarOperarioDefinitivo as eliminarOperarioDefinitivoBusiness,
} from '@/lib/agenda-business'

export type AgendaState = { success?: boolean; error?: string; warning?: string } | undefined

async function requireUser() {
  const db = await getServerDb()
  const user = await getSessionUser()
  if (!user) throw new Error('No autenticado.')
  return db
}

function revalidateEventos() {
  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/agenda/calendario')
  revalidatePath('/agenda-tv')
}

// El form manda de vuelta a dónde volver después de guardar (día/semana del
// calendario del que vino). Antes el redirect post-save estaba hardcodeado a
// /dashboard/agenda siempre, así que crear o editar un evento te sacaba del
// día en el que estabas parado. Se valida que sea una ruta propia (no un
// string arbitrario) para no abrir un redirect a otro dominio.
function safeFrom(value: FormDataEntryValue | null): string | null {
  return typeof value === 'string' && value.startsWith('/dashboard/agenda') ? value : null
}

function redirectConSaved(from: string | null, saved: string): never {
  const base = from ?? '/dashboard/agenda'
  redirect(`${base}${base.includes('?') ? '&' : '?'}saved=${saved}`)
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

function parseEventoForm(formData: FormData, schema: typeof eventoAgendaSchema | typeof crearEventoSchema) {
  return schema.safeParse({
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
    const db = await requireUser()
    return await getRecursosOcupadosBusiness(db, fecha, fechaHasta, horaInicio, horaFin, excludeEventoId)
  } catch {
    return { gruaIds: [], operarioIds: [] }
  }
}

// ─── Eventos ────────────────────────────────────────────────────────────────

export async function createEvento(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const parsed = parseEventoForm(formData, crearEventoSchema)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

    const { hora_fin, ...rest } = parsed.data
    const operarioIds = parseOperarioIds(formData.get('operario_ids'))

    const errorGrua = await validarGrua(db, rest.grua_id)
    if (errorGrua) return { error: errorGrua }

    const errorOperarios = await validarOperarios(db, operarioIds)
    if (errorOperarios) return { error: errorOperarios }

    const conflicto = await buscarConflicto(db, parsed.data, rest.grua_id, operarioIds)
    if (conflicto) return { error: conflicto }

    const { data, error } = await db
      .from('eventos_agenda')
      .insert({ ...rest, hora_fin: hora_fin || null })
      .select('id')
      .single()

    if (error || !data) return { error: error ? friendlyError(error) : 'No se pudo crear el evento.' }

    const syncError = await syncEventoOperarios(db, data.id, operarioIds)
    if (syncError) return { error: syncError }

    revalidateEventos()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirectConSaved(safeFrom(formData.get('from')), 'created')
}

export async function updateEvento(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de evento requerido.' }

    const parsed = parseEventoForm(formData, eventoAgendaSchema)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

    const { hora_fin, ...rest } = parsed.data

    const errorEdicion = await validarEdicionEvento(db, id, { ...rest, hora_fin: hora_fin || null })
    if (errorEdicion) return { error: errorEdicion }

    const operarioIds = parseOperarioIds(formData.get('operario_ids'))

    // Cancelar libera recursos: no se exige grúa/operarios activos ni se re-chequea conflicto.
    if (parsed.data.estado !== 'cancelado') {
      const errorGrua = await validarGrua(db, rest.grua_id)
      if (errorGrua) return { error: errorGrua }

      const errorOperarios = await validarOperarios(db, operarioIds)
      if (errorOperarios) return { error: errorOperarios }

      const conflicto = await buscarConflicto(db, parsed.data, rest.grua_id, operarioIds, id)
      if (conflicto) return { error: conflicto }
    }

    const { error } = await db
      .from('eventos_agenda')
      .update({ ...rest, hora_fin: hora_fin || null, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: friendlyError(error) }

    const syncError = await syncEventoOperarios(db, id, operarioIds)
    if (syncError) return { error: syncError }

    revalidateEventos()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirectConSaved(safeFrom(formData.get('from')), 'updated')
}

/**
 * Cambio rápido de estado (equivale al PATCH de la app con el evento tal cual y
 * solo el estado distinto). Pasa por las mismas validaciones que editar: solo
 * transiciones hacia adelante, finalizado/cancelado no se tocan, y se re-chequea
 * conflicto de grúa/operarios (p. ej. reserva -> programado).
 */
export async function cambiarEstadoEvento(id: string, estado: EstadoEvento): Promise<AgendaState> {
  try {
    const db = await requireUser()
    if (!id) return { error: 'ID de evento requerido.' }
    if (!ESTADOS_EVENTO.includes(estado)) return { error: 'Estado inválido.' }

    const evento = await getEventoAgendaById(id, db)
    if (!evento) return { error: 'No se encontró el evento.' }
    if (!evento.grua_id || !evento.empresa_id) return { error: 'El evento no tiene grúa o empresa asignada.' }

    const parsed = eventoAgendaSchema.safeParse({
      fecha: evento.fecha,
      fecha_hasta: evento.fecha_hasta,
      hora_inicio: evento.hora_inicio,
      hora_fin: evento.hora_fin,
      grua_id: evento.grua_id,
      empresa_id: evento.empresa_id,
      ubicacion: evento.ubicacion,
      notas: evento.notas,
      estado,
    })
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const { hora_fin, ...rest } = parsed.data

    const errorEdicion = await validarEdicionEvento(db, id, { ...rest, hora_fin: hora_fin || null })
    if (errorEdicion) return { error: errorEdicion }

    const operarioIds = evento.operarios.map((o) => o.id)

    // Mismas validaciones que el PATCH de la app (que manda el evento completo).
    // Cancelar libera recursos: no se exige grúa/operarios activos ni se re-chequea conflicto.
    if (estado !== 'cancelado') {
      const errorGrua = await validarGrua(db, rest.grua_id)
      if (errorGrua) return { error: errorGrua }
      const errorOperarios = await validarOperarios(db, operarioIds)
      if (errorOperarios) return { error: errorOperarios }

      const conflicto = await buscarConflicto(db, parsed.data, rest.grua_id, operarioIds, id)
      if (conflicto) return { error: conflicto }
    }

    const { error } = await db
      .from('eventos_agenda')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: friendlyError(error) }

    revalidateEventos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}

export async function deleteEvento(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de evento requerido.' }

    const errorBorrado = await validarBorradoEvento(db, id)
    if (errorBorrado) return { error: errorBorrado }

    const { error } = await db.from('eventos_agenda').delete().eq('id', id)
    if (error) return { error: friendlyError(error) }

    revalidateEventos()
  } catch (e) {
    return { error: friendlyError(e) }
  }
  redirectConSaved(safeFrom(formData.get('from')), 'deleted')
}

// ─── Catálogos (gruas / empresas_agenda / operarios) ───────────────────────

async function catalogToggle(table: CatalogTable, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    const activo = formData.get('activo') === 'true'
    const result = await catalogToggleBusiness(db, table, id, activo)
    if (result.error) return { error: result.error }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}

async function catalogDelete(table: CatalogTable, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    const result = await catalogDeleteBusiness(db, table, id)
    if (result.error) return { error: result.error }
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
    foto_url:            formData.get('foto_url') || undefined,
  })
}

export async function createGrua(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const parsed = parseGruaForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const duplicado = await gruaDuplicada(db, parsed.data.nombre, parsed.data.patente)
    if (duplicado) return { error: duplicado }
    const { error } = await db.from('gruas').insert(parsed.data)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
export async function updateGrua(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de grúa requerido.' }
    const parsed = parseGruaForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const duplicado = await gruaDuplicada(db, parsed.data.nombre, parsed.data.patente, id)
    if (duplicado) return { error: duplicado }
    const { error } = await db.from('gruas').update(parsed.data).eq('id', id)
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

function parseEmpresaAgendaForm(formData: FormData) {
  return empresaAgendaSchema.safeParse({
    nombre:   formData.get('nombre'),
    contacto: formData.get('contacto') || null,
    telefono: formData.get('telefono') || null,
    tipo:     formData.get('tipo') || undefined,
    notas:    formData.get('notas'),
    logo_url: formData.get('logo_url') || undefined,
  })
}

export async function createEmpresaAgenda(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const parsed = parseEmpresaAgendaForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const duplicada = await empresaAgendaDuplicada(db, parsed.data.nombre)
    if (duplicada) return { error: duplicada }
    const { error } = await db.from('empresas_agenda').insert(parsed.data)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
export async function updateEmpresaAgenda(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de empresa requerido.' }
    const parsed = parseEmpresaAgendaForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const duplicada = await empresaAgendaDuplicada(db, parsed.data.nombre, id)
    if (duplicada) return { error: duplicada }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tipo, ...resto } = parsed.data
    const { error } = await db.from('empresas_agenda').update(formData.has('tipo') ? parsed.data : resto).eq('id', id)
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

function parseOperarioForm(formData: FormData) {
  return operarioSchema.safeParse({
    nombre:   formData.get('nombre'),
    telefono: formData.get('telefono') || null,
    roles:    formData.getAll('roles'),
    foto_url: formData.get('foto_url') || undefined,
  })
}

export async function createOperario(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const parsed = parseOperarioForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const duplicado = await operarioDuplicado(db, parsed.data.nombre)
    if (duplicado) return { error: duplicado }
    const { error } = await db.from('operarios').insert(parsed.data)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
export async function updateOperario(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de operario requerido.' }
    const parsed = parseOperarioForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const duplicado = await operarioDuplicado(db, parsed.data.nombre, id)
    if (duplicado) return { error: duplicado }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roles, ...resto } = parsed.data
    const { error } = await db.from('operarios').update(formData.has('roles__presente') ? parsed.data : resto).eq('id', id)
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

// ─── Ex operarios (baja lógica) ────────────────────────────────────────────
// Misma lógica que la app móvil vía /api/agenda/operarios/[id].

export async function reincorporarOperario(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de operario requerido.' }
    const result = await reincorporarOperarioBusiness(db, id)
    if (result.error) return { error: result.error }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}

export async function deleteOperarioDefinitivo(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const db = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de operario requerido.' }
    const result = await eliminarOperarioDefinitivoBusiness(db, id)
    if (result.error) return { error: result.error }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
