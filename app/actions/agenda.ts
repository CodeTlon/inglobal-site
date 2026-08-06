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
} from '@/lib/validations/agenda'
import {
  type CatalogTable,
  validarGrua,
  validarOperarios,
  syncEventoOperarios,
  buscarConflicto,
  getRecursosOcupados as getRecursosOcupadosBusiness,
  validarEdicionEvento,
  catalogToggle as catalogToggleBusiness,
  catalogDelete as catalogDeleteBusiness,
  gruaDuplicada,
  empresaAgendaDuplicada,
} from '@/lib/agenda-business'

export type AgendaState = { success?: boolean; error?: string; warning?: string } | undefined

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
    return await getRecursosOcupadosBusiness(supabase, fecha, fechaHasta, horaInicio, horaFin, excludeEventoId)
  } catch {
    return { gruaIds: [], operarioIds: [] }
  }
}

// ─── Eventos ────────────────────────────────────────────────────────────────

export async function createEvento(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = parseEventoForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

    const { hora_fin, ...rest } = parsed.data
    const operarioIds = parseOperarioIds(formData.get('operario_ids'))

    const errorGrua = await validarGrua(supabase, rest.grua_id)
    if (errorGrua) return { error: errorGrua }

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

    const errorGrua = await validarGrua(supabase, rest.grua_id)
    if (errorGrua) return { error: errorGrua }

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

async function catalogToggle(table: CatalogTable, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    const activo = formData.get('activo') === 'true'
    const result = await catalogToggleBusiness(supabase, table, id, activo)
    if (result.error) return { error: result.error }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}

async function catalogDelete(table: CatalogTable, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    const result = await catalogDeleteBusiness(supabase, table, id)
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
  })
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

function parseEmpresaAgendaForm(formData: FormData) {
  return empresaAgendaSchema.safeParse({
    nombre:   formData.get('nombre'),
    contacto: formData.get('contacto'),
    telefono: formData.get('telefono'),
    notas:    formData.get('notas'),
  })
}

export async function createEmpresaAgenda(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = parseEmpresaAgendaForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const duplicada = await empresaAgendaDuplicada(supabase, parsed.data.nombre)
    if (duplicada) return { error: duplicada }
    const { error } = await supabase.from('empresas_agenda').insert(parsed.data)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
export async function updateEmpresaAgenda(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de empresa requerido.' }
    const parsed = parseEmpresaAgendaForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const duplicada = await empresaAgendaDuplicada(supabase, parsed.data.nombre, id)
    if (duplicada) return { error: duplicada }
    const { error } = await supabase.from('empresas_agenda').update(parsed.data).eq('id', id)
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
    telefono: formData.get('telefono'),
  })
}

export async function createOperario(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = parseOperarioForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const { error } = await supabase.from('operarios').insert(parsed.data)
    if (error) return { error: friendlyError(error) }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: friendlyError(e) }
  }
}
export async function updateOperario(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de operario requerido.' }
    const parsed = parseOperarioForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const { error } = await supabase.from('operarios').update(parsed.data).eq('id', id)
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
